import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import 'dotenv/config'
import { hashPassword } from '../lib/auth'

const { Pool } = pg

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Create the adapter
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Seed Interests
  const interestCategories = {
    'Hobbies': [
      { name: 'Photography', icon: '📷' },
      { name: 'Cooking', icon: '🍳' },
      { name: 'Traveling', icon: '✈️' },
      { name: 'Reading', icon: '📚' },
      { name: 'Gaming', icon: '🎮' },
      { name: 'Music', icon: '🎵' },
      { name: 'Art', icon: '🎨' },
      { name: 'Dancing', icon: '💃' },
      { name: 'Hiking', icon: '🥾' },
      { name: 'Cycling', icon: '🚴' },
      { name: 'Yoga', icon: '🧘' },
      { name: 'Running', icon: '🏃' },
    ],
    'Sports': [
      { name: 'Soccer', icon: '⚽' },
      { name: 'Basketball', icon: '🏀' },
      { name: 'Tennis', icon: '🎾' },
      { name: 'Swimming', icon: '🏊' },
      { name: 'Gym', icon: '🏋️' },
      { name: 'Martial Arts', icon: '🥋' },
      { name: 'Rock Climbing', icon: '🧗' },
      { name: 'Skiing', icon: '⛷️' },
    ],
    'Entertainment': [
      { name: 'Movies', icon: '🎬' },
      { name: 'TV Shows', icon: '📺' },
      { name: 'Theater', icon: '🎭' },
      { name: 'Concerts', icon: '🎤' },
      { name: 'Comedy', icon: '😂' },
      { name: 'Podcasts', icon: '🎙️' },
    ],
    'Food & Drink': [
      { name: 'Coffee', icon: '☕' },
      { name: 'Wine', icon: '🍷' },
      { name: 'Beer', icon: '🍺' },
      { name: 'Foodie', icon: '🍕' },
      { name: 'Vegan', icon: '🥗' },
      { name: 'Baking', icon: '🧁' },
    ],
    'Lifestyle': [
      { name: 'Fashion', icon: '👗' },
      { name: 'Sustainability', icon: '♻️' },
      { name: 'Volunteering', icon: '🤝' },
      { name: 'Politics', icon: '🗳️' },
      { name: 'Activism', icon: '✊' },
      { name: 'Meditation', icon: '🧘' },
      { name: 'Astrology', icon: '⭐' },
    ],
    'Outdoors': [
      { name: 'Camping', icon: '⛺' },
      { name: 'Beach', icon: '🏖️' },
      { name: 'Fishing', icon: '🎣' },
      { name: 'Gardening', icon: '🌱' },
      { name: 'Nature', icon: '🌲' },
    ],
    'Creative': [
      { name: 'Writing', icon: '✍️' },
      { name: 'Singing', icon: '🎤' },
      { name: 'DIY Projects', icon: '🔨' },
      { name: 'Film Making', icon: '🎥' },
      { name: 'Design', icon: '🎨' },
    ],
    'Tech': [
      { name: 'Technology', icon: '💻' },
      { name: 'Coding', icon: '👨‍💻' },
      { name: 'Crypto', icon: '₿' },
      { name: 'AI & ML', icon: '🤖' },
    ],
    'Social': [
      { name: 'Nightlife', icon: '🌃' },
      { name: 'Networking', icon: '👥' },
      { name: 'Board Games', icon: '🎲' },
      { name: 'Trivia', icon: '❓' },
    ]
  }

  for (const [category, interests] of Object.entries(interestCategories)) {
    for (const interest of interests) {
      await prisma.interest.upsert({
        where: { name: interest.name },
        update: {},
        create: {
          name: interest.name,
          category: category,
          icon: interest.icon,
        },
      })
    }
  }

  console.log('✅ Interests seeded')

  // Seed Prompts
  const prompts = [
    { question: 'My simple pleasures', category: 'Lifestyle' },
    { question: 'A life goal of mine', category: 'Personal' },
    { question: 'I geek out on', category: 'Interests' },
    { question: 'My most controversial opinion', category: 'Fun' },
    { question: 'Don\'t hate me if I', category: 'Fun' },
    { question: 'The way to win me over is', category: 'Dating' },
    { question: 'I\'m looking for', category: 'Dating' },
    { question: 'The best way to ask me out', category: 'Dating' },
    { question: 'My love language is', category: 'Dating' },
    { question: 'First date idea', category: 'Dating' },
    { question: 'I\'m a regular at', category: 'Lifestyle' },
    { question: 'My go-to karaoke song', category: 'Fun' },
    { question: 'The key to my heart', category: 'Dating' },
    { question: 'I\'m weirdly attracted to', category: 'Fun' },
    { question: 'My ideal Sunday', category: 'Lifestyle' },
    { question: 'Green flags I look for', category: 'Dating' },
    { question: 'My self-care routine', category: 'Lifestyle' },
    { question: 'A random fact I love', category: 'Fun' },
    { question: 'I\'m convinced that', category: 'Personal' },
    { question: 'Two truths and a lie', category: 'Fun' },
    { question: 'I want someone who', category: 'Dating' },
    { question: 'My most irrational fear', category: 'Personal' },
    { question: 'Unusual skills', category: 'Personal' },
    { question: 'My simple pleasures', category: 'Lifestyle' },
    { question: 'I recently discovered', category: 'Interests' },
    { question: 'My travel story', category: 'Lifestyle' },
    { question: 'Change my mind about', category: 'Fun' },
    { question: 'Together we could', category: 'Dating' },
    { question: 'I\'m actually really good at', category: 'Personal' },
    { question: 'Last great book I read', category: 'Interests' },
  ]

  for (const prompt of prompts) {
    await prisma.prompt.upsert({
      where: { question: prompt.question },
      update: {},
      create: {
        question: prompt.question,
        category: prompt.category,
        isActive: true,
      },
    })
  }

  console.log('✅ Prompts seeded')
  console.log('👤 Seeding sample profiles...')

  const interestList = await prisma.interest.findMany({
    select: { id: true, name: true },
  })
  const promptList = await prisma.prompt.findMany({
    select: { id: true, question: true },
  })

  const interestByName = new Map(interestList.map((interest) => [interest.name, interest.id]))
  const promptByQuestion = new Map(promptList.map((prompt) => [prompt.question, prompt.id]))

  const passwordHash = await hashPassword('Password123!')

  const sampleProfiles = [
    {
      email: 'ava.wright@example.com',
      firstName: 'Ava',
      lastName: 'Wright',
      displayName: 'Ava',
      dateOfBirth: new Date('1996-04-11'),
      gender: 'WOMAN',
      interestedIn: ['MAN', 'WOMAN'],
      bio: 'Coffee-fueled designer who never says no to a sunset hike. Looking for someone who enjoys city nights and trail mornings.',
      jobTitle: 'Product Designer',
      company: 'Cloudline',
      school: 'UCLA',
      height: 168,
      location: 'San Francisco, CA',
      latitude: 37.7749,
      longitude: -122.4194,
      isVerified: true,
      isEmailVerified: true,
      photos: [
        { url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&w=800&h=1000', order: 0, isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=facearea&w=800&h=1000', order: 1, isPrimary: false },
        { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=800&h=1000', order: 2, isPrimary: false },
      ],
      interests: ['Photography', 'Coffee', 'Hiking', 'Traveling', 'Yoga'],
      prompts: [
        { question: 'My simple pleasures', answer: 'Warm croissant, espresso, and a good playlist.' },
        { question: 'First date idea', answer: 'Street tacos followed by a sunset walk by the water.' },
        { question: 'I geek out on', answer: 'Color palettes, typography, and small cafes.' },
      ],
    },
    {
      email: 'milo.park@example.com',
      firstName: 'Milo',
      lastName: 'Park',
      displayName: 'Milo',
      dateOfBirth: new Date('1993-08-22'),
      gender: 'MAN',
      interestedIn: ['WOMAN'],
      bio: 'Weekend climber, weekday software engineer. I love building side projects and finding the best ramen in town.',
      jobTitle: 'Software Engineer',
      company: 'North Bay Labs',
      school: 'UC Berkeley',
      height: 180,
      location: 'Oakland, CA',
      latitude: 37.8044,
      longitude: -122.2711,
      isVerified: true,
      isEmailVerified: true,
      photos: [
        { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&w=800&h=1000', order: 0, isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=facearea&w=800&h=1000', order: 1, isPrimary: false },
        { url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=facearea&w=800&h=1000', order: 2, isPrimary: false },
      ],
      interests: ['Rock Climbing', 'Coding', 'Foodie', 'Traveling', 'Board Games'],
      prompts: [
        { question: 'I geek out on', answer: 'Bouldering routes and new JS frameworks.' },
        { question: 'My ideal Sunday', answer: 'Farmers market, climbing gym, then a movie night.' },
        { question: 'The way to win me over is', answer: 'Laugh at my bad puns and love spicy food.' },
      ],
    },
    {
      email: 'noah.reed@example.com',
      firstName: 'Noah',
      lastName: 'Reed',
      displayName: 'Noah',
      dateOfBirth: new Date('1990-01-05'),
      gender: 'MAN',
      interestedIn: ['WOMAN', 'NON_BINARY'],
      bio: 'Chef by trade, playlist curator by night. I can cook but will always ask you to pick the dessert.',
      jobTitle: 'Executive Chef',
      company: 'Juniper Kitchen',
      school: 'Culinary Institute',
      height: 176,
      location: 'San Jose, CA',
      latitude: 37.3382,
      longitude: -121.8863,
      isVerified: false,
      isEmailVerified: true,
      photos: [
        { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=800&h=1000', order: 0, isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1524503033411-c9566986fc8f?auto=format&fit=facearea&w=800&h=1000', order: 1, isPrimary: false },
        { url: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=facearea&w=800&h=1000', order: 2, isPrimary: false },
      ],
      interests: ['Cooking', 'Wine', 'Music', 'Movies', 'Foodie'],
      prompts: [
        { question: 'First date idea', answer: 'Cook together with a playlist and a glass of wine.' },
        { question: 'My love language is', answer: 'Acts of service (like making breakfast).' },
        { question: 'My simple pleasures', answer: 'Fresh pasta and a quiet kitchen.' },
      ],
    },
    {
      email: 'lena.patel@example.com',
      firstName: 'Lena',
      lastName: 'Patel',
      displayName: 'Lena',
      dateOfBirth: new Date('1998-11-14'),
      gender: 'WOMAN',
      interestedIn: ['MAN'],
      bio: 'Runner, reader, and proud dog aunt. If you can recommend a great book, we will get along.',
      jobTitle: 'Marketing Manager',
      company: 'Vista Studio',
      school: 'NYU',
      height: 165,
      location: 'Palo Alto, CA',
      latitude: 37.4419,
      longitude: -122.1430,
      isVerified: true,
      isEmailVerified: true,
      photos: [
        { url: 'https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?auto=format&fit=facearea&w=800&h=1000', order: 0, isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=800&h=1000', order: 1, isPrimary: false },
        { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&w=800&h=1000', order: 2, isPrimary: false },
      ],
      interests: ['Running', 'Reading', 'Coffee', 'Yoga', 'Traveling'],
      prompts: [
        { question: 'Last great book I read', answer: 'The Seven Husbands of Evelyn Hugo.' },
        { question: 'My self-care routine', answer: 'Long runs, long showers, and longer novels.' },
        { question: 'The key to my heart', answer: 'Honesty, kindness, and a love for coffee.' },
      ],
    },
    {
      email: 'carmen.soto@example.com',
      firstName: 'Carmen',
      lastName: 'Soto',
      displayName: 'Carmen',
      dateOfBirth: new Date('1995-06-03'),
      gender: 'WOMAN',
      interestedIn: ['WOMAN', 'NON_BINARY'],
      bio: 'Museum hopper, weekend cyclist, and always chasing live music. Ask me about my favorite local shows.',
      jobTitle: 'Community Manager',
      company: 'Brightside',
      school: 'USC',
      height: 170,
      location: 'San Mateo, CA',
      latitude: 37.5630,
      longitude: -122.3255,
      isVerified: false,
      isEmailVerified: true,
      photos: [
        { url: 'https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?auto=format&fit=facearea&w=800&h=1000', order: 0, isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?auto=format&fit=facearea&w=800&h=1000', order: 1, isPrimary: false },
        { url: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=facearea&w=800&h=1000', order: 2, isPrimary: false },
      ],
      interests: ['Music', 'Cycling', 'Art', 'Concerts', 'Movies'],
      prompts: [
        { question: 'My go-to karaoke song', answer: 'Dreams by Fleetwood Mac.' },
        { question: 'Together we could', answer: 'Bike to the coast and catch a show at night.' },
        { question: 'My simple pleasures', answer: 'Street art walks and cold brew.' },
      ],
    },
    {
      email: 'jayden.brooks@example.com',
      firstName: 'Jayden',
      lastName: 'Brooks',
      displayName: 'Jayden',
      dateOfBirth: new Date('1992-09-18'),
      gender: 'NON_BINARY',
      interestedIn: ['EVERYONE'],
      bio: 'Photographer and weekend surfer. I like early mornings, late-night tacos, and people who laugh easily.',
      jobTitle: 'Photographer',
      company: 'Freelance',
      school: 'Art Center',
      height: 172,
      location: 'Santa Cruz, CA',
      latitude: 36.9741,
      longitude: -122.0308,
      isVerified: true,
      isEmailVerified: true,
      photos: [
        { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&w=800&h=1000', order: 0, isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?auto=format&fit=facearea&w=800&h=1000', order: 1, isPrimary: false },
        { url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=facearea&w=800&h=1000', order: 2, isPrimary: false },
      ],
      interests: ['Photography', 'Beach', 'Swimming', 'Traveling', 'Coffee'],
      prompts: [
        { question: 'My travel story', answer: 'I once chased sunrise in three different time zones.' },
        { question: 'I want someone who', answer: 'Is curious, kind, and up for spontaneous adventures.' },
        { question: 'Change my mind about', answer: 'Pineapple on pizza.' },
      ],
    },
  ]

  for (const profile of sampleProfiles) {
    const existing = await prisma.user.findUnique({
      where: { email: profile.email },
      select: { id: true },
    })

    if (existing) {
      await prisma.photo.deleteMany({ where: { userId: existing.id } })
      await prisma.userInterest.deleteMany({ where: { userId: existing.id } })
      await prisma.userPrompt.deleteMany({ where: { userId: existing.id } })
    }

    const interestIds = profile.interests
      .map((name) => interestByName.get(name))
      .filter((id): id is string => Boolean(id))

    const promptInputs = profile.prompts
      .map((prompt) => {
        const promptId = promptByQuestion.get(prompt.question)
        if (!promptId) {
          return null
        }
        return {
          promptId,
          answer: prompt.answer,
        }
      })
      .filter((prompt): prompt is { promptId: string; answer: string } => Boolean(prompt))

    const data = {
      email: profile.email,
      passwordHash,
      firstName: profile.firstName,
      lastName: profile.lastName,
      displayName: profile.displayName,
      dateOfBirth: profile.dateOfBirth,
      gender: profile.gender as any,
      interestedIn: profile.interestedIn as any,
      bio: profile.bio,
      jobTitle: profile.jobTitle,
      company: profile.company,
      school: profile.school,
      height: profile.height,
      location: profile.location,
      latitude: profile.latitude,
      longitude: profile.longitude,
      isVerified: profile.isVerified,
      isEmailVerified: profile.isEmailVerified,
      isActive: true,
      lastActive: new Date(),
      photos: {
        create: profile.photos,
      },
      interests: {
        create: interestIds.map((interestId) => ({
          interest: { connect: { id: interestId } },
        })),
      },
      prompts: {
        create: promptInputs.map((prompt) => ({
          prompt: { connect: { id: prompt.promptId } },
          answer: prompt.answer,
        })),
      },
    }

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data,
      })
    } else {
      await prisma.user.create({ data })
    }
  }

  console.log('✅ Sample profiles seeded')
  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
