import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkLocations() {
  const users = await prisma.user.findMany({
    where: { gender: 'MAN', photos: { some: {} } },
    select: {
      email: true,
      latitude: true,
      longitude: true,
      location: true
    },
    take: 10
  });
  
  console.log('Male users with photos:');
  users.forEach(u => {
    const hasLocation = u.latitude && u.longitude;
    console.log(`${u.email} - ${hasLocation ? `${u.latitude}, ${u.longitude} (${u.location})` : 'NO LOCATION'}`);
  });
  
  await prisma.$disconnect();
}

checkLocations();
