import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import 'dotenv/config'

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
