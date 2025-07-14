import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create sample users
  const parentPassword = await bcrypt.hash('parent123', 10);
  const securityPassword = await bcrypt.hash('security123', 10);
  const wardenPassword = await bcrypt.hash('warden123', 10);

  const parent = await prisma.user.create({
    data: {
      email: 'parent@example.com',
      password: parentPassword,
      name: 'John Doe (Parent)',
      role: 'PARENT'
    }
  });

  const security = await prisma.user.create({
    data: {
      email: 'security@example.com',
      password: securityPassword,
      name: 'Security Guard',
      role: 'SECURITY'
    }
  });

  const warden = await prisma.user.create({
    data: {
      email: 'warden@example.com',
      password: wardenPassword,
      name: 'Hostel Warden',
      role: 'WARDEN'
    }
  });

  // Create sample students
  const students = [
    {
      name: 'Alice Johnson',
      rollNumber: 'CS21001',
      course: 'Computer Science',
      branch: 'Software Engineering',
      year: 3,
      hostelName: 'Sunrise Hostel',
      roomNumber: 'A-201'
    },
    {
      name: 'Bob Smith',
      rollNumber: 'ME21002',
      course: 'Mechanical Engineering',
      branch: 'Thermal Engineering',
      year: 2,
      hostelName: 'Sunrise Hostel',
      roomNumber: 'B-105'
    },
    {
      name: 'Carol Williams',
      rollNumber: 'EE21003',
      course: 'Electrical Engineering',
      branch: 'Power Systems',
      year: 4,
      hostelName: 'Moonlight Hostel',
      roomNumber: 'C-301'
    },
    {
      name: 'David Brown',
      rollNumber: 'CE21004',
      course: 'Civil Engineering',
      branch: 'Structural Engineering',
      year: 1,
      hostelName: 'Moonlight Hostel',
      roomNumber: 'D-102'
    }
  ];

  for (const studentData of students) {
    await prisma.student.create({
      data: studentData
    });
  }

  console.log('Sample data created successfully!');
  console.log('\nLogin credentials:');
  console.log('Parent: parent@example.com / parent123');
  console.log('Security: security@example.com / security123');
  console.log('Warden: warden@example.com / warden123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
