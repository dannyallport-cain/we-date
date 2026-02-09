import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import 'dotenv/config'
import { hashPassword } from './lib/auth'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = 'test.user@example.com'
  const firstName = 'Test'
  const password = 'password123'
  
  // Check if user exists
  const existing = await prisma.user.findUnique({
    where: { email }
  })
  
  if (existing) {
    console.log('User already exists, deleting...')
    await prisma.user.delete({
      where: { email }
    })
  }
  
  // Hash password
  const passwordHash = await hashPassword(password)
  
  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      displayName: firstName,
      dateOfBirth: new Date('2000-01-01'),
      gender: 'MAN',
      interestedIn: ['WOMAN'],
      showMe: 'WOMAN',
    }
  })
  
  console.log('✅ Test user created successfully!')
  console.log('Email:', email)
  console.log('Password:', password)
  console.log('User ID:', user.id)
}

main()
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
