import { prisma } from '../src/lib/prisma';

async function checkWardenRole() {
  try {
    console.log('Checking warden users...\n');

    // Get all users with HOSTEL_WARDEN role
    const wardens = await prisma.user.findMany({
      where: {
        role: 'HOSTEL_WARDEN'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        hostelName: true,
      }
    });

    if (wardens.length === 0) {
      console.log('No warden users found in database.');
      return;
    }

    console.log(`Found ${wardens.length} warden(s):\n`);
    wardens.forEach((warden, index) => {
      console.log(`${index + 1}. ${warden.name}`);
      console.log(`   Email: ${warden.email}`);
      console.log(`   Role: ${warden.role}`);
      console.log(`   Hostel: ${warden.hostelName || 'N/A'}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error checking warden roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWardenRole();
