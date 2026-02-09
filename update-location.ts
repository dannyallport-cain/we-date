import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function updateLocation() {
  const updated = await prisma.user.update({
    where: { email: 'fullprofile@example.com' },
    data: {
      location: 'Manchester, UK',
      latitude: 53.4808,
      longitude: -2.2426,
      maxDistance: 50 // 50km radius
    }
  });
  
 console.log('✅ Updated location!');
  console.log('Location:', updated.location);
  console.log('Coordinates:', updated.latitude, updated.longitude);
  console.log('Max Distance:', updated.maxDistance, 'km');
  
  await prisma.$disconnect();
}

updateLocation();
