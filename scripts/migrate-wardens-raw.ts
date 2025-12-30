/**
 * Script to update WARDEN role to HOSTEL_WARDEN in MongoDB
 * This uses raw MongoDB queries to bypass Prisma validation
 * Run with: npx tsx scripts/migrate-wardens-raw.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateWardensRaw() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  Migrating WARDEN → HOSTEL_WARDEN         ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    // Use raw MongoDB command to find and update wardens
    const result = await prisma.$runCommandRaw({
      update: 'User',
      updates: [
        {
          q: { role: 'WARDEN' },
          u: { 
            $set: { 
              role: 'HOSTEL_WARDEN',
              hostelName: 'Agasthya Bhavanam' // Default hostel
            } 
          },
          multi: true
        }
      ]
    });

    console.log('Migration Result:', result);
    console.log(`\n✓ Updated ${result.n || 0} warden account(s)`);
    console.log('  New role: HOSTEL_WARDEN');
    console.log('  Default hostel: Agasthya Bhavanam');
    console.log('\nNote: All wardens were assigned to Agasthya Bhavanam by default.');
    console.log('You can manually update specific wardens for other hostels:\n');
    console.log('  - Vasishta Bhavanam');
    console.log('  - Gautama Bhavanam\n');

  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateWardensRaw()
  .then(() => {
    console.log('✓ Migration completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Migration failed:', error);
    process.exit(1);
  });
