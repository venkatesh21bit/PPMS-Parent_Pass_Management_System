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
  context: unknown
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

    let qrCode: string | undefined;
    if (
      context &&
      typeof context === 'object' &&
      'params' in context &&
      (context as { params?: unknown }).params &&
      typeof (context as { params: unknown }).params === 'object' &&
      'qrCode' in (context as { params: { qrCode?: unknown } }).params
    ) {
      qrCode = ((context as { params: { qrCode?: unknown } }).params.qrCode) as string;
    }

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

    // Check if visit is expired
    const now = new Date();
    if (visitRequest.validUntil && visitRequest.validUntil < now) {
      return NextResponse.json({
        valid: false,
        message: 'Visit request has expired'
      });
    }

    // Determine next action based on scan history
    const lastScan = visitRequest.scanLogs[0]; // Most recent scan
    let nextAction: 'ENTRY' | 'EXIT';
    let currentStatus: string;

    if (!lastScan) {
      // No previous scans - this is first scan (ENTRY)
      nextAction = 'ENTRY';
      currentStatus = 'No previous scans - ready for entry';
      // Allow entry even if not approved
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
            year: visitRequest.student.year
          },
          parent: {
            name: visitRequest.parent.name,
            email: visitRequest.parent.email
          },
          validFrom: visitRequest.validFrom,
          validUntil: visitRequest.validUntil,
          lastScan: null
        }
      });
    } else if (lastScan.scanType === 'ENTRY') {
      // Last scan was entry - next should be exit
      nextAction = 'EXIT';
      currentStatus = 'Currently inside - ready for exit';
      // Require approval for exit
      const approvedApproval = visitRequest.approvals.find(approval => approval.status === true);
      if (!approvedApproval) {
        return NextResponse.json({
          valid: false,
          message: 'Visit request is not approved for exit yet'
        });
      }
    } else {
      // Last scan was exit - next should be entry
      nextAction = 'ENTRY';
      currentStatus = 'Currently outside - ready for entry';
      // Allow re-entry (if needed)
    }

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
          year: visitRequest.student.year
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
