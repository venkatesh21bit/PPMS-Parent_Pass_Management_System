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

    // Check if visit is within valid time range
    const now = new Date();
    if (now < visitRequest.validFrom || now > visitRequest.validUntil) {
      return NextResponse.json(
        { error: 'Visit request is outside valid time range' },
        { status: 400 }
      );
    }

    // Auto-detect scan type based on existing scan logs
    const lastScan = visitRequest.scanLogs[0];
    let scanType: 'ENTRY' | 'EXIT';

    if (!lastScan) {
      // First scan is always ENTRY
      scanType = 'ENTRY';
    } else if (lastScan.scanType === 'ENTRY') {
      // Last scan was entry, so this is EXIT
      scanType = 'EXIT';
    } else {
      // Last scan was exit, so this is ENTRY (re-entry)
      scanType = 'ENTRY';
    }

    // Only require approval for EXIT scan
    if (scanType === 'EXIT' && visitRequest.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Visit request is not approved for exit' },
        { status: 400 }
      );
    }

    // Create scan log
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

    return NextResponse.json({
      message: `${scanType.toLowerCase()} recorded successfully`,
      scanLog,
      visitRequest: {
        ...visitRequest,
        scanType
      }
    });

  } catch (error) {
    console.error('Scan record error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
