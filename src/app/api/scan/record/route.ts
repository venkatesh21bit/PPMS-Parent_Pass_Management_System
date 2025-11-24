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

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }


    // Check if user is SECURITY
    if (user.role !== 'SECURITY') {
      return NextResponse.json(
        { error: 'Access denied. Only security personnel can scan QR codes.' },
        { status: 403 }
      );
    }

    const { qrCode } = await request.json();

    if (!qrCode) {
      return NextResponse.json(
        { error: 'QR code is required' },
        { status: 400 }
      );
    }

    // Find the visit request
    const visitRequest = await prisma.visitRequest.findUnique({
      where: { qrCode },
      include: {
        student: true,
        parent: {
          select: { name: true, email: true }
        },
        approvals: true,
        scanLogs: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!visitRequest) {
      return NextResponse.json(
        { error: 'Invalid QR code' },
        { status: 404 }
      );
    }

    // Check if visit has expired (only check validUntil)
    const now = new Date();
    if (visitRequest.validUntil && new Date(visitRequest.validUntil) < now) {
      return NextResponse.json(
        { error: 'Visit request has expired' },
        { status: 400 }
      );
    }

    // Auto-detect scan type based on current status
    let scanType: 'ENTRY' | 'EXIT';

    if (visitRequest.status === 'PENDING') {
      // First scan - ENTRY
      scanType = 'ENTRY';
    } else if (visitRequest.status === 'INSIDE') {
      // Student is inside - EXIT scan (requires approval)
      scanType = 'EXIT';
      // Check if approved
      const approvedApproval = visitRequest.approvals?.find((approval: { status: boolean }) => approval.status === true);
      if (!approvedApproval) {
        return NextResponse.json(
          { error: 'Visit request must be approved by warden before exit' },
          { status: 400 }
        );
      }
    } else if (visitRequest.status === 'APPROVED') {
      // Warden approved - ready for EXIT
      scanType = 'EXIT';
    } else {
      // Status is REJECTED or OUT
      return NextResponse.json(
        { error: 'Invalid pass status. Cannot scan.' },
        { status: 400 }
      );
    }

    // Create scan log and update visit request status
    const scanLog = await prisma.scanLog.create({
      data: {
        visitRequestId: visitRequest.id,
        scannedBy: user.id,
        scanType,
        timestamp: now
      },
      include: {
        scanner: {
          select: { name: true, role: true }
        }
      }
    });

    // Update visit request status based on scan type
    const newStatus = scanType === 'ENTRY' ? 'INSIDE' : 'OUT';
    const updatedVisitRequest = await prisma.visitRequest.update({
      where: { id: visitRequest.id },
      data: { status: newStatus }
    });

    return NextResponse.json({
      message: `${scanType.toLowerCase()} recorded successfully`,
      scanLog,
      visitRequest: {
        ...updatedVisitRequest,
        scanType
      }
    });

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
