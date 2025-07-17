
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

export async function POST(
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

    // Check if user is WARDEN
    if (user.role !== 'WARDEN') {
      return NextResponse.json(
        { error: 'Access denied. Only wardens can approve visit requests.' },
        { status: 403 }
      );
    }

    let id: string | undefined;
    if (
      context &&
      typeof context === 'object' &&
      'params' in context &&
      (context as { params?: unknown }).params &&
      typeof (context as { params: unknown }).params === 'object' &&
      'id' in (context as { params: { id?: unknown } }).params
    ) {
      id = ((context as { params: { id?: unknown } }).params.id) as string;
    }
    if (!id) {
      return NextResponse.json(
        { error: 'Visit request id is required' },
        { status: 400 }
      );
    }
    const { status, remarks } = await request.json();

    if (typeof status !== 'boolean') {
      return NextResponse.json(
        { error: 'Status (boolean) is required' },
        { status: 400 }
      );
    }

    const visitRequest = await prisma.visitRequest.findUnique({
      where: { id },
      include: {
        student: true,
        parent: {
          select: { name: true, email: true }
        }
      }
    });

    if (!visitRequest) {
      return NextResponse.json(
        { error: 'Visit request not found' },
        { status: 404 }
      );
    }

    // Create approval record
    const approval = await prisma.approval.create({
      data: {
        visitRequestId: id,
        wardenId: user.id,
        status,
        remarks
      }
    });

    // Update visit request status
    const updatedVisitRequest = await prisma.visitRequest.update({
      where: { id },
      data: {
        status: status ? 'APPROVED' : 'REJECTED'
      },
      include: {
        student: true,
        parent: {
          select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json({
      message: `Visit request ${status ? 'approved' : 'rejected'} successfully`,
      visitRequest: updatedVisitRequest,
      approval
    });
  } catch (error) {
    console.error('Approve visit request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
