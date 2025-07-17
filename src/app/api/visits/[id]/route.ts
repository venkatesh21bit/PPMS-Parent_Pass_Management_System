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

// GET /api/visits/[id] - Get individual visit request
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    const visitRequest = await prisma.visitRequest.findUnique({
      where: { id },
      include: {
        student: true,
        parent: {
          select: { name: true, email: true }
        },
        approvals: {
          include: {
            warden: {
              select: { name: true, email: true }
            }
          }
        },
        scanLogs: {
          include: {
            scanner: {
              select: { name: true, role: true }
            }
          },
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!visitRequest) {
      return NextResponse.json(
        { error: 'Visit request not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (user.role === 'PARENT' && visitRequest.parentId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      visitRequest
    });
  } catch (error) {
      console.error('Get visit request error:');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/visits/[id] - Delete visit request

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params;

    // Find the visit request
    const visitRequest = await prisma.visitRequest.findUnique({
      where: { id },
      include: {
        scanLogs: true,
        approvals: true
      }
    });

    if (!visitRequest) {
      return NextResponse.json(
        { error: 'Visit request not found' },
        { status: 404 }
      );
    }

    // Check permissions - only the parent who created it can delete it
    if (user.role === 'PARENT' && visitRequest.parentId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied. You can only delete your own visit requests.' },
        { status: 403 }
      );
    }

    // Check if visit can be deleted (only if it hasn't been scanned)
    if (visitRequest.scanLogs.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete visit request that has already been scanned' },
        { status: 400 }
      );
    }

    // Delete related records first (due to foreign key constraints)
    await prisma.approval.deleteMany({
      where: { visitRequestId: id }
    });

    await prisma.scanLog.deleteMany({
      where: { visitRequestId: id }
    });

    // Delete the visit request
    await prisma.visitRequest.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Visit request deleted successfully'
    });

  } catch (error) {
    console.error('Delete visit request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
