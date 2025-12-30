/**
 * Script to create hostel warden accounts for each hostel
 * Run with: npx tsx scripts/create-hostel-wardens.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createHostelWardens() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  Creating Hostel Warden Accounts          ║');
  console.log('╚════════════════════════════════════════════╝\n');

  const hostels = [
    { name: 'Agasthya Bhavanam', email: 'agasthya.warden@college.edu' },
    { name: 'Vasishta Bhavanam', email: 'vasishta.warden@college.edu' },
    { name: 'Gautama Bhavanam', email: 'gautama.warden@college.edu' }
  ];

  const defaultPassword = 'warden123'; // Change this to a secure password
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  try {
    for (const hostel of hostels) {
      // Check if warden already exists
      const existing = await prisma.user.findUnique({
        where: { email: hostel.email }
      });

      if (existing) {
        console.log(`⚠️  Warden for ${hostel.name} already exists (${hostel.email})`);
        console.log(`   Updating hostelName assignment...`);
        
        await prisma.user.update({
          where: { email: hostel.email },
          data: {
            role: 'HOSTEL_WARDEN',
            hostelName: hostel.name
          }
        });
        console.log(`   ✓ Updated successfully\n`);
      } else {
        console.log(`Creating warden for ${hostel.name}...`);
        
        await prisma.user.create({
          data: {
            email: hostel.email,
            password: hashedPassword,
            name: `${hostel.name} Warden`,
            role: 'HOSTEL_WARDEN',
            hostelName: hostel.name
          }
        });
        
        console.log(`✓ Created warden account`);
        console.log(`  Email: ${hostel.email}`);
        console.log(`  Password: ${defaultPassword}`);
        console.log(`  Hostel: ${hostel.name}\n`);
      }
    }

    console.log('╔════════════════════════════════════════════╗');
    console.log('║  Hostel Warden Account Summary            ║');
    console.log('╚════════════════════════════════════════════╝\n');
    console.log('IMPORTANT: Change these passwords immediately!\n');
    console.log('Login Credentials:');
    console.log('==================');
    for (const hostel of hostels) {
      console.log(`\n${hostel.name}:`);
      console.log(`  Email: ${hostel.email}`);
      console.log(`  Password: ${defaultPassword}`);
      console.log(`  Portal: /hostel/${hostel.name.toLowerCase().split(' ')[0]}`);
    }
    console.log('\n');

  } catch (error) {
    console.error('Error during warden creation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createHostelWardens()
  .then(() => {
    console.log('✓ Script completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Script failed:', error);
    process.exit(1);
  });
