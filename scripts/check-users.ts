import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  const users = await prisma.user.findMany();
  console.log('\nExisting Users:');
  console.log('================');
  users.forEach(user => {
    console.log(`\nName: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Hostel: ${user.hostelName || 'Not assigned'}`);
  });
  console.log(`\nTotal: ${users.length} user(s)\n`);
  await prisma.$disconnect();
}

checkUsers();
