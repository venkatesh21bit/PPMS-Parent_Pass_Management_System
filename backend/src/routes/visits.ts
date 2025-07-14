import express from 'express';
import { prisma } from '../index';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { generateQRCode } from '../utils/qrcode';
import { v4 as uuidv4 } from 'uuid';
import { io } from '../index';

const router = express.Router();

// Create visit request (Parent only)
router.post('/', authenticateToken, requireRole(['PARENT']), async (req: AuthRequest, res) => {
  try {
    const { 
      studentName, 
      rollNumber,
      hostelName, 
      roomNumber, 
      degree, 
      branch, 
      year, 
      vehicleNo, 
      purpose, 
      validFrom, 
      validUntil 
    } = req.body;

    if (!studentName || !rollNumber || !hostelName || !validFrom || !validUntil) {
      return res.status(400).json({ error: 'Student name, roll number, hostel name, valid from, and valid until are required' });
    }

    // Create or find student record
    let student = await prisma.student.findFirst({
      where: {
        OR: [
          { rollNumber: rollNumber },
          {
            AND: [
              { name: studentName },
              { hostelName: hostelName }
            ]
          }
        ]
      }
    });

    if (!student) {
      // Create new student record
      student = await prisma.student.create({
        data: {
          name: studentName,
          rollNumber: rollNumber,
          course: degree || 'Not specified',
          branch: branch || 'Not specified',
          year: year || 1,
          hostelName,
          roomNumber: roomNumber || undefined
        }
      });
    } else {
      // Update existing student record with new information if provided
      const updateData: any = {};
      if (rollNumber && student.rollNumber !== rollNumber) updateData.rollNumber = rollNumber;
      if (roomNumber && student.roomNumber !== roomNumber) updateData.roomNumber = roomNumber;
      if (degree && student.course !== degree) updateData.course = degree;
      if (branch && student.branch !== branch) updateData.branch = branch;
      if (year && student.year !== year) updateData.year = year;
      if (studentName && student.name !== studentName) updateData.name = studentName;
      if (hostelName && student.hostelName !== hostelName) updateData.hostelName = hostelName;

      if (Object.keys(updateData).length > 0) {
        student = await prisma.student.update({
          where: { id: student.id },
          data: updateData
        });
      }
    }

    // Generate unique QR code
    const qrCode = uuidv4();

    const visitRequest = await prisma.visitRequest.create({
      data: {
        parentId: req.user!.id,
        studentId: student.id,
        vehicleNo,
        purpose,
        qrCode,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil)
      },
      include: {
        student: true,
        parent: {
          select: { name: true, email: true }
        }
      }
    });

    // Generate QR code image
    const qrCodeImage = await generateQRCode(qrCode);

    // Notify wardens
    io.to('WARDEN').emit('new-visit-request', {
      visitRequest,
      message: `New visit request from ${req.user!.name} for ${student.name}`
    });

    res.status(201).json({
      message: 'Visit request created successfully',
      visitRequest: {
        ...visitRequest,
        qrCodeImage
      }
    });
  } catch (error) {
    console.error('Create visit request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get visit requests by user role
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { status, hostelName } = req.query;
    let whereClause: any = {};

    // Filter based on user role
    if (req.user!.role === 'PARENT') {
      whereClause.parentId = req.user!.id;
    } else if (req.user!.role === 'WARDEN' && hostelName) {
      whereClause.student = {
        hostelName: hostelName as string
      };
    }

    // Add status filter if provided
    if (status) {
      whereClause.status = status;
    }

    const visitRequests = await prisma.visitRequest.findMany({
      where: whereClause,
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
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ visitRequests });
  } catch (error) {
    console.error('Get visit requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get visit request by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

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
      return res.status(404).json({ error: 'Visit request not found' });
    }

    // Check permissions
    if (req.user!.role === 'PARENT' && visitRequest.parentId !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Generate QR code image for the response
    const qrCodeImage = await generateQRCode(visitRequest.qrCode);

    res.json({
      visitRequest: {
        ...visitRequest,
        qrCodeImage
      }
    });
  } catch (error) {
    console.error('Get visit request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve/Reject visit request (Warden only)
router.post('/:id/approve', authenticateToken, requireRole(['WARDEN']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (typeof status !== 'boolean') {
      return res.status(400).json({ error: 'Status (boolean) is required' });
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
      return res.status(404).json({ error: 'Visit request not found' });
    }

    // Create approval record
    const approval = await prisma.approval.create({
      data: {
        visitRequestId: id,
        wardenId: req.user!.id,
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

    // Notify parent and security
    const notification = {
      visitRequest: updatedVisitRequest,
      approval,
      message: `Visit request ${status ? 'approved' : 'rejected'} by ${req.user!.name}`
    };

    io.to('PARENT').emit('visit-status-update', notification);
    if (status) {
      io.to('SECURITY').emit('new-approved-visit', notification);
    }

    res.json({
      message: `Visit request ${status ? 'approved' : 'rejected'} successfully`,
      visitRequest: updatedVisitRequest,
      approval
    });
  } catch (error) {
    console.error('Approve visit request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pending scanned visits (Warden only)
router.get('/pending-scans', authenticateToken, requireRole(['WARDEN']), async (req: AuthRequest, res) => {
  try {
    // Get visit requests that have been scanned but are still pending approval
    const pendingScannedVisits = await prisma.visitRequest.findMany({
      where: {
        status: 'PENDING',
        scanLogs: {
          some: {
            scanType: 'ENTRY'
          }
        }
      },
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
        scanLogs: {
          _count: 'desc'
        }
      }
    });

    res.json({ pendingScannedVisits });
  } catch (error) {
    console.error('Get pending scanned visits error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
