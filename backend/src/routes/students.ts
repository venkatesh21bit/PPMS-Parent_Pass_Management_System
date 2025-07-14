import express from 'express';
import { prisma } from '../index';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all students (for selection in parent form)
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const students = await prisma.student.findMany({
      select: {
        id: true,
        name: true,
        rollNumber: true,
        course: true,
        branch: true,
        year: true,
        hostelName: true,
        roomNumber: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({ students });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search students by name or roll number
router.get('/search', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const students = await prisma.student.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { rollNumber: { contains: q } },
          { course: { contains: q } },
          { branch: { contains: q } },
          { hostelName: { contains: q } }
        ]
      },
      select: {
        id: true,
        name: true,
        rollNumber: true,
        course: true,
        branch: true,
        year: true,
        hostelName: true,
        roomNumber: true
      },
      take: 10
    });

    res.json({ students });
  } catch (error) {
    console.error('Search students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new student (admin/warden only)
router.post('/', authenticateToken, requireRole(['WARDEN']), async (req: AuthRequest, res) => {
  try {
    const { name, rollNumber, course, branch, year, hostelName, roomNumber } = req.body;

    // Validate required fields
    if (!name || !rollNumber || !course || !branch || !year || !hostelName) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Check if student with roll number already exists
    const existingStudent = await prisma.student.findUnique({
      where: { rollNumber }
    });

    if (existingStudent) {
      return res.status(400).json({ error: 'Student with this roll number already exists' });
    }

    const student = await prisma.student.create({
      data: {
        name,
        rollNumber,
        course,
        branch,
        year: parseInt(year),
        hostelName,
        roomNumber
      }
    });

    res.status(201).json({
      message: 'Student created successfully',
      student
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        visitRequests: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            parent: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ student });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
