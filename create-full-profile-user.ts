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

async function createFullProfileUser() {
  try {
    const email = 'fullprofile@example.com'
    const password = 'password123'

    // Delete existing test user if it exists
    await prisma.user.deleteMany({
      where: { email }
    })

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create comprehensive test user with full profile
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: 'Sarah',
        displayName: 'Sarah Chen',
        dateOfBirth: new Date('1995-06-15'),
        gender: 'WOMAN',
        interestedIn: ['MAN'],
        showMe: 'MAN',
        bio: 'Adventure seeker 🏔️ | Coffee enthusiast ☕ | Love exploring new places and trying new restaurants. Looking for someone genuine who enjoys deep conversations and spontaneous road trips.',
        location: 'San Francisco, CA',
        latitude: 37.7749,
        longitude: -122.4194,
        ageMin: 25,
        ageMax: 35,
        maxDistance: 30,
        isEmailVerified: true,
        photos: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop',
              order: 0,
              isPrimary: true
            },
            {
              url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
              order: 1
            },
            {
              url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop',
              order: 2
            },
            {
              url: 'https://images.unsplash.com/photo-1517534531203-a52e3c3a8ad5?w=400&h=500&fit=crop',
              order: 3
            }
          ]
        }
      }
    })

    // Connect interests
    const interestNames = ['hiking', 'cooking', 'travel', 'photography', 'yoga', 'reading']
    for (const interestName of interestNames) {
      const interest = await prisma.interest.findFirst({
        where: { name: interestName }
      })
      if (interest) {
        await prisma.userInterest.create({
          data: {
            userId: user.id,
            interestId: interest.id
          }
        })
      }
    }

    // Connect prompts
    const promptAnswers = {
      'My ideal first date would be...': 'A cozy coffee shop or scenic hike followed by lunch at an interesting restaurant',
      'My most unusual talent is...': 'I can make perfect latte art and solve a Rubik\'s cube in under 2 minutes',
      'People are usually surprised to learn that...': 'I\'ve backpacked solo through 12 countries and speak 3 languages'
    }
    
    for (const [question, answer] of Object.entries(promptAnswers)) {
      const prompt = await prisma.prompt.findFirst({
        where: { question }
      })
      if (prompt) {
        await prisma.userPrompt.create({
          data: {
            userId: user.id,
            promptId: prompt.id,
            answer
          }
        })
      }
    }

    console.log('✅ Full profile user created successfully!')
    console.log('\n📧 LOGIN CREDENTIALS:')
    console.log('Email: ' + email)
    console.log('Password: ' + password)
    console.log('\n👤 PROFILE DETAILS:')
    console.log('Name: Sarah Chen')
    console.log('Age: 30')
    console.log('Gender: Woman')
    console.log('Location: San Francisco, CA')
    console.log('Bio: Adventure seeker with full profile')
    console.log('Photos: 4 high-quality images')
    console.log('Interests: hiking, cooking, travel, photography, yoga, reading')
    console.log('Prompts: 3 interesting responses filled')
    console.log('Email verified: ✅ Yes')
    console.log('Onboarded: ✅ Yes')
    console.log('User ID: ' + user.id)
  } catch (error) {
    console.error('Error creating user:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createFullProfileUser()
  .then(() => {
    process.exit(0)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
