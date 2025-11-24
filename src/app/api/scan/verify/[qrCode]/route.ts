import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

// Middleware to authenticate JWT token
async function authenticate(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ qrCode: string }> }
) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { qrCode } = await context.params;

    if (!qrCode) {
      return NextResponse.json(
        { error: 'QR code is required' },
        { status: 400 }
      );
    }

    // Find the visit request by QR code
    const visitRequest = await prisma.visitRequest.findUnique({
      where: { qrCode },
      include: {
        student: true,
        parent: true,
        approvals: true,
        scanLogs: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!visitRequest) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid QR code - visit request not found'
      });
    }

    // Check if pass is already OUT (completed)
    if (visitRequest.status === 'OUT') {
      return NextResponse.json({
        valid: false,
        message: 'Invalid QR code - this pass has already been used and student has exited'
      });
    }

    // Check if visit is expired (only check validUntil, not validFrom)
    const now = new Date();
    if (visitRequest.validUntil && new Date(visitRequest.validUntil) < now) {
      console.log('Pass expired check:', {
        validUntil: visitRequest.validUntil,
        validUntilDate: new Date(visitRequest.validUntil),
        now: now,
        expired: new Date(visitRequest.validUntil) < now
      });
      return NextResponse.json({
        valid: false,
        message: `Visit request has expired. Valid until: ${new Date(visitRequest.validUntil).toLocaleString()}, Current time: ${now.toLocaleString()}`
      });
    }

    // Determine next action based on current status
    let nextAction: 'ENTRY' | 'EXIT';
    let currentStatus: string;

    if (visitRequest.status === 'PENDING') {
      // First scan - ENTRY
      nextAction = 'ENTRY';
      currentStatus = 'Pass pending - ready for entry scan';
    } else if (visitRequest.status === 'INSIDE') {
      // Student is inside - next should be exit
      nextAction = 'EXIT';
      currentStatus = 'Student inside - needs warden approval before exit';
      // Require approval for exit
      const approvedApproval = visitRequest.approvals.find((approval: { status: boolean }) => approval.status === true);
      if (!approvedApproval) {
        return NextResponse.json({
          valid: false,
          message: 'Visit request is not approved by warden yet. Student cannot exit.'
        });
      }
    } else if (visitRequest.status === 'APPROVED') {
      // Warden approved - ready for exit
      nextAction = 'EXIT';
      currentStatus = 'Approved - ready for exit scan';
    } else if (visitRequest.status === 'REJECTED') {
      return NextResponse.json({
        valid: false,
        message: 'Visit request was rejected by warden'
      });
    } else {
      // Status is OUT or unknown
      return NextResponse.json({
        valid: false,
        message: 'Invalid pass status'
      });
    }

    const lastScan = visitRequest.scanLogs[0]; // Most recent scan

    return NextResponse.json({
      valid: true,
      nextAction,
      currentStatus,
      visitRequest: {
        id: visitRequest.id,
        purpose: visitRequest.purpose,
        student: {
          name: visitRequest.student.name,
          rollNumber: visitRequest.student.rollNumber,
          course: visitRequest.student.course,
          year: visitRequest.student.year,
          roomNumber: visitRequest.student.roomNumber
        },
        parent: {
          name: visitRequest.parent.name,
          email: visitRequest.parent.email
        },
        validFrom: visitRequest.validFrom,
        validUntil: visitRequest.validUntil,
        lastScan: lastScan ? {
          type: lastScan.scanType,
          timestamp: lastScan.timestamp,
          location: lastScan.location
        } : null
      }
    });

  } catch (error) {
    console.error('Verify QR error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
