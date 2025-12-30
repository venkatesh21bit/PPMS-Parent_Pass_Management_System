/**
 * Test script to verify form validation and hostel filtering
 * Run with: npx tsx scripts/test-features.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test roll number validation
function testRollNumberValidation() {
  console.log('=== Testing Roll Number Validation ===\n');
  
  const rollNumberRegex = /^CB\.SC\.U4[A-Z]{3}\d{5}$/i;
  
  const testCases = [
    { input: 'CB.SC.U4CSE23519', expected: true },
    { input: 'CB.SC.U4ECE12345', expected: true },
    { input: 'CB.SC.U4MEC98765', expected: true },
    { input: 'cb.sc.u4cse23519', expected: true }, // lowercase should work
    { input: 'CB.SC.U4CS23519', expected: false },  // only 2 letters
    { input: 'CB.SC.U4CSEE23519', expected: false }, // 4 letters
    { input: 'CB.SC.U4CSE2351', expected: false },  // only 4 digits
    { input: 'CB.SC.U4CSE235190', expected: false }, // 6 digits
    { input: 'CB.SC.U3CSE23519', expected: false },  // U3 instead of U4
  ];

  let passed = 0;
  let failed = 0;

  testCases.forEach(test => {
    const result = rollNumberRegex.test(test.input);
    const status = result === test.expected ? '✓ PASS' : '✗ FAIL';
    
    if (result === test.expected) {
      passed++;
    } else {
      failed++;
    }
    
    console.log(`${status}: "${test.input}" -> ${result} (expected: ${test.expected})`);
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
}

// Test hostel filtering
async function testHostelFiltering() {
  console.log('=== Testing Hostel Filtering ===\n');

  try {
    const hostels = ['Agasthya Bhavanam', 'Vasishta Bhavanam', 'Gautama Bhavanam'];

    for (const hostel of hostels) {
      console.log(`Checking visits for ${hostel}:`);
      
      const visits = await prisma.visitRequest.findMany({
        where: {
          student: {
            hostelName: hostel
          }
        },
        include: {
          student: true
        }
      });

      console.log(`  Found ${visits.length} visit(s)`);
      
      if (visits.length > 0) {
        console.log(`  Sample visits:`);
        visits.slice(0, 3).forEach(visit => {
          console.log(`    - ${visit.student?.name} (${visit.student?.hostelName}) - Status: ${visit.status}`);
        });
      }
      console.log();
    }

    // Check if there are any visits without hostel assignment
    console.log('Checking for visits without hostel assignment...');
    
    const allVisits = await prisma.visitRequest.findMany({
      include: {
        student: true
      }
    });

    const unassignedVisits = allVisits.filter(v => 
      !v.student?.hostelName || v.student.hostelName.trim() === ''
    );

    if (unassignedVisits.length > 0) {
      console.log(`⚠️  Warning: Found ${unassignedVisits.length} visit(s) with students not assigned to a hostel`);
      console.log(`   These visits won't appear in any hostel portal!\n`);
    } else {
      console.log(`✓ All visits have hostel assignments\n`);
    }

  } catch (error) {
    console.error('Error during hostel filtering test:', error);
  }
}

// Test hostel warden accounts
async function testHostelWardens() {
  console.log('=== Testing Hostel Warden Accounts ===\n');

  try {
    const hostelWardens = await prisma.user.findMany({
      where: {
        role: 'HOSTEL_WARDEN'
      }
    });

    console.log(`Found ${hostelWardens.length} hostel warden account(s)\n`);

    if (hostelWardens.length === 0) {
      console.log('⚠️  No HOSTEL_WARDEN accounts found!');
      console.log('   Run the update-wardens.ts script to migrate WARDEN accounts.\n');
    } else {
      hostelWardens.forEach(warden => {
        console.log(`✓ ${warden.name} (${warden.email})`);
        console.log(`  Role: ${warden.role}`);
        console.log(`  Hostel: ${warden.hostelName || 'NOT ASSIGNED ⚠️'}`);
        console.log();
      });
    }

    // Note: WARDEN role no longer exists in schema, migration completed

  } catch (error) {
    console.error('Error during warden account test:', error);
  }
}

// Main test runner
async function runTests() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  Feature Testing & Validation Suite       ║');
  console.log('╚════════════════════════════════════════════╝\n');

  // Test 1: Roll number validation
  testRollNumberValidation();

  // Test 2: Hostel warden accounts
  await testHostelWardens();

  // Test 3: Hostel filtering
  await testHostelFiltering();

  console.log('╔════════════════════════════════════════════╗');
  console.log('║  All tests completed                       ║');
  console.log('╚════════════════════════════════════════════╝\n');

  await prisma.$disconnect();
}

// Run all tests
runTests()
  .then(() => {
    console.log('✓ Test suite finished\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ Test suite failed:', error);
    process.exit(1);
  });
