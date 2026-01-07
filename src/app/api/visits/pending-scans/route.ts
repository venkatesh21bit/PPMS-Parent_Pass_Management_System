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

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is WARDEN or HOSTEL_WARDEN
    if (user.role !== 'WARDEN' && user.role !== 'HOSTEL_WARDEN') {
      return NextResponse.json(
        { error: 'Access denied. Only wardens can access pending scanned visits.' },
        { status: 403 }
      );
    }

    // Build where clause based on warden type
    const whereClause: {
      status: 'INSIDE';
      student?: { hostelName: string };
    } = {
      status: 'INSIDE'
    };

    // If hostel warden, filter by their hostel
    if (user.role === 'HOSTEL_WARDEN' && user.hostelName) {
      whereClause.student = { hostelName: user.hostelName };
    }

    // Get visit requests that have been scanned for entry (INSIDE status) and need approval
    const pendingScannedVisits = await prisma.visitRequest.findMany({
      where: whereClause,
      include: {
        student: true,
        parent: {
          select: { name: true, email: true }
        },
        scanLogs: {
          where: {
            scanType: 'ENTRY'
          },
          orderBy: { timestamp: 'desc' },
          take: 1,
          include: {
            scanner: {
              select: { name: true, role: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ pendingScannedVisits });
  } catch (error) {
    console.error('Get pending scanned visits error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
