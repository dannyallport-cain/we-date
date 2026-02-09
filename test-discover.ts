import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';
import { generateToken } from './lib/auth.js';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testDiscover() {
  const user = await prisma.user.findUnique({
    where: { email: 'fullprofile@example.com' }
  });
  
  if (!user) {
    console.log('User not found');
    return;
  }
  
  const token = generateToken(user.id);
  console.log('Testing /api/discover endpoint...');
  console.log('User ID:', user.id);
  console.log('Gender:', user.gender);
  console.log('ShowMe:', user.showMe);
  console.log('Age range:', user.ageMin, '-', user.ageMax);
  
  // Make a request to the endpoint
  const response = await fetch('http://localhost:3000/api/discover', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log('\nStatus:', response.status);
  console.log('Users found:', data.users?.length || 0);
  
  if (data.users && data.users.length > 0) {
    console.log('\nUser profiles:');
    data.users.slice(0, 5).forEach((u: any) => {
      console.log(`- ${u.displayName} (${u.age}) - ${u.distance || 'no distance'}`);
    });
  } else {
    console.log('\nNo users found. Response:', JSON.stringify(data, null, 2));
  }
  
  await prisma.$disconnect();
  process.exit(0);
}

testDiscover().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
