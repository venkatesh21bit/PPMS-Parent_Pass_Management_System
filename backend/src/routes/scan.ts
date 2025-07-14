import express from 'express';
import { prisma } from '../index';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { io } from '../index';

const router = express.Router();

// Scan QR code (Security only)
router.post('/scan', authenticateToken, requireRole(['SECURITY']), async (req: AuthRequest, res) => {
  try {
    const { qrCode, scanType, location, remarks } = req.body;

    if (!qrCode || !scanType) {
      return res.status(400).json({ error: 'QR code and scan type are required' });
    }

    // Find visit request by QR code
    const visitRequest = await prisma.visitRequest.findUnique({
      where: { qrCode },
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
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });

    if (!visitRequest) {
      return res.status(404).json({ error: 'Invalid QR code' });
    }

    // Check visit request status and handle accordingly
    if (visitRequest.status === 'PENDING') {
      // For pending visits, create scan log and notify warden for approval
      if (scanType !== 'ENTRY') {
        return res.status(400).json({ 
          error: 'Only entry scans allowed for pending visits' 
        });
      }

      // Create scan log for pending visit
      const scanLog = await prisma.scanLog.create({
        data: {
          visitRequestId: visitRequest.id,
          scannedBy: req.user!.id,
          scanType,
          location: location || 'Main Gate',
          remarks: remarks || 'Pending approval scan'
        },
        include: {
          visitRequest: {
            include: {
              student: true,
              parent: {
                select: { name: true, email: true }
              }
            }
          }
        }
      });

      // Notify all wardens about the scan requiring approval
      const wardens = await prisma.user.findMany({
        where: { role: 'WARDEN' }
      });

      // Emit real-time notification to wardens
      io.emit('scan_pending_approval', {
        scanLog,
        visitRequest,
        message: `New entry scan requires approval for ${visitRequest.student?.name}`
      });

      return res.json({
        success: true,
        message: 'Entry scan recorded. Waiting for warden approval.',
        scanLog,
        status: 'PENDING_APPROVAL'
      });
    }

    if (visitRequest.status === 'REJECTED') {
      return res.status(400).json({ 
        error: 'Visit request has been rejected',
        visitRequest: {
          id: visitRequest.id,
          status: visitRequest.status,
          student: visitRequest.student,
          parent: visitRequest.parent
        }
      });
    }

    if (visitRequest.status !== 'APPROVED') {
      return res.status(400).json({ 
        error: 'Visit request not in valid state for scanning',
        status: visitRequest.status
      });
    }

    // Check validity period
    const now = new Date();
    if (now < visitRequest.validFrom || now > visitRequest.validUntil) {
      return res.status(400).json({ 
        error: 'Visit request expired or not yet valid',
        validFrom: visitRequest.validFrom,
        validUntil: visitRequest.validUntil
      });
    }

    // Validate scan type sequence
    const lastScan = visitRequest.scanLogs[0];
    if (scanType === 'EXIT' && (!lastScan || lastScan.scanType !== 'ENTRY')) {
      return res.status(400).json({ error: 'Cannot exit without entry scan' });
    }
    if (scanType === 'ENTRY' && lastScan && lastScan.scanType === 'ENTRY') {
      return res.status(400).json({ error: 'Already scanned for entry' });
    }

    // Create scan log
    const scanLog = await prisma.scanLog.create({
      data: {
        visitRequestId: visitRequest.id,
        scannedBy: req.user!.id,
        scanType,
        location,
        remarks
      },
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
      }
    });

    // Update visit request status if exiting
    if (scanType === 'EXIT') {
      await prisma.visitRequest.update({
        where: { id: visitRequest.id },
        data: { status: 'COMPLETED' }
      });
    }

    // Send real-time notifications
    const notification = {
      scanLog,
      message: `${scanType === 'ENTRY' ? 'Entry' : 'Exit'} scan completed for ${visitRequest.student.name}`
    };

    io.to('WARDEN').emit('scan-update', notification);
    io.to('PARENT').emit('scan-update', notification);

    res.json({
      message: `${scanType === 'ENTRY' ? 'Entry' : 'Exit'} scan successful`,
      scanLog,
      visitRequest: {
        id: visitRequest.id,
        student: visitRequest.student,
        parent: visitRequest.parent,
        status: scanType === 'EXIT' ? 'COMPLETED' : visitRequest.status
      }
    });
  } catch (error) {
    console.error('Scan QR code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get visit request by QR code (for verification)
router.get('/verify/:qrCode', authenticateToken, requireRole(['SECURITY']), async (req: AuthRequest, res) => {
  try {
    const { qrCode } = req.params;

    const visitRequest = await prisma.visitRequest.findUnique({
      where: { qrCode },
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
      return res.status(404).json({ error: 'Invalid QR code' });
    }

    // Check validity
    const now = new Date();
    const isValid = visitRequest.status === 'APPROVED' && 
                   now >= visitRequest.validFrom && 
                   now <= visitRequest.validUntil;

    res.json({
      visitRequest,
      isValid,
      currentTime: now
    });
  } catch (error) {
    console.error('Verify QR code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify QR code (POST endpoint for frontend)
router.post('/verify', authenticateToken, requireRole(['SECURITY']), async (req: AuthRequest, res) => {
  try {
    const { qrCode } = req.body;

    if (!qrCode) {
      return res.status(400).json({ error: 'QR code is required' });
    }

    const visitRequest = await prisma.visitRequest.findUnique({
      where: { qrCode },
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
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });

    if (!visitRequest) {
      return res.json({ 
        valid: false, 
        message: 'Invalid QR code or visit request not found' 
      });
    }

    // Check if visit request is within valid time range
    const now = new Date();
    const validFrom = new Date(visitRequest.validFrom);
    const validUntil = new Date(visitRequest.validUntil);

    if (now < validFrom || now > validUntil) {
      return res.json({ 
        valid: false, 
        message: 'Visit request is outside valid time range' 
      });
    }

    res.json({ 
      valid: true, 
      visitRequest,
      message: 'Valid QR code' 
    });
  } catch (error) {
    console.error('Verify QR code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get scan logs (for security dashboard)
router.get('/logs', authenticateToken, requireRole(['SECURITY', 'WARDEN']), async (req: AuthRequest, res) => {
  try {
    const { date, scanType, hostelName } = req.query;
    let whereClause: any = {};

    // Filter by date if provided
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      whereClause.timestamp = {
        gte: startDate,
        lt: endDate
      };
    }

    // Filter by scan type
    if (scanType) {
      whereClause.scanType = scanType;
    }

    // Filter by hostel if warden
    if (req.user!.role === 'WARDEN' && hostelName) {
      whereClause.visitRequest = {
        student: {
          hostelName: hostelName as string
        }
      };
    }

    const scanLogs = await prisma.scanLog.findMany({
      where: whereClause,
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
      take: 100
    });

    res.json({ scanLogs });
  } catch (error) {
    console.error('Get scan logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
