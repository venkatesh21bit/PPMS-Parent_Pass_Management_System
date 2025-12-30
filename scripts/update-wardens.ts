/**
 * Script to update existing WARDEN accounts to HOSTEL_WARDEN with assigned hostel names
 * Run with: npx tsx scripts/update-wardens.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateWardens() {
  console.log('Starting warden account migration...\n');

  try {
    // Get all existing wardens
    const wardens = await prisma.user.findMany({
      where: {
        role: 'WARDEN'
      }
    });

    console.log(`Found ${wardens.length} warden account(s) to update\n`);

    if (wardens.length === 0) {
      console.log('No warden accounts found to update.');
      return;
    }

    // Update each warden
    // You can customize the hostel assignment logic here
    for (let i = 0; i < wardens.length; i++) {
      const warden = wardens[i];
      
      // Assign hostels in round-robin fashion or customize as needed
      const hostels = ['Agasthya Bhavanam', 'Vasishta Bhavanam', 'Gautama Bhavanam'];
      const assignedHostel = hostels[i % 3]; // Round-robin assignment

      console.log(`Updating: ${warden.name} (${warden.email})`);
      console.log(`  Old role: WARDEN`);
      console.log(`  New role: HOSTEL_WARDEN`);
      console.log(`  Assigned hostel: ${assignedHostel}`);

      await prisma.user.update({
        where: { id: warden.id },
        data: {
          role: 'HOSTEL_WARDEN',
          hostelName: assignedHostel
        }
      });

      console.log(`  ✓ Updated successfully\n`);
    }

    console.log('Migration completed successfully!');
    console.log('\nSummary:');
    console.log(`- Updated ${wardens.length} warden account(s)`);
    console.log(`- All wardens now have role: HOSTEL_WARDEN`);
    console.log(`- Hostels assigned: Agasthya Bhavanam, Vasishta Bhavanam, Gautama Bhavanam`);

  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
updateWardens()
  .then(() => {
    console.log('\n✓ Migration script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Migration failed:', error);
    process.exit(1);
  });
