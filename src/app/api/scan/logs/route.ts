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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return decoded;
  } catch (error) {
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

    // Check if user is SECURITY
    if (user.role !== 'SECURITY') {
      return NextResponse.json(
        { error: 'Access denied. Only security personnel can view scan logs.' },
        { status: 403 }
      );
    }

    const scanLogs = await prisma.scanLog.findMany({
      include: {
        visitRequest: {
          include: {
            student: true,
            parent: {
              select: { name: true, email: true }
            }
          }
        },
        scanner: {
          select: { name: true, role: true }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 50 // Limit to recent 50 scans
    });

    return NextResponse.json({ scanLogs });
  } catch (error) {
    console.error('Get scan logs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
