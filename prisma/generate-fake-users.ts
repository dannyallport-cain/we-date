import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import 'dotenv/config'
import { hashPassword } from '../lib/auth'
import { faker } from '@faker-js/faker'

const { Pool } = pg

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Create the adapter
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

// North West England cities with approximate coordinates
const nwEnglandCities = [
  { name: 'Manchester', lat: 53.4808, lng: -2.2426 },
  { name: 'Liverpool', lat: 53.4084, lng: -2.9916 },
  { name: 'Leeds', lat: 53.8008, lng: -1.5491 },
  { name: 'Sheffield', lat: 53.3811, lng: -1.4701 },
  { name: 'Newcastle upon Tyne', lat: 54.9783, lng: -1.6178 },
  { name: 'Salford', lat: 53.4875, lng: -2.2901 },
  { name: 'Bradford', lat: 53.7950, lng: -1.7594 },
  { name: 'Birmingham', lat: 52.4862, lng: -1.8904 }, // Borderline, but including
  { name: 'Warrington', lat: 53.3900, lng: -2.5970 },
  { name: 'Stockport', lat: 53.4083, lng: -2.1494 },
  { name: 'Oldham', lat: 53.5409, lng: -2.1114 },
  { name: 'Rochdale', lat: 53.6097, lng: -2.1561 },
  { name: 'Bolton', lat: 53.5769, lng: -2.4282 },
  { name: 'Wigan', lat: 53.5451, lng: -2.6321 },
  { name: 'Blackburn', lat: 53.7486, lng: -2.4849 },
  { name: 'Preston', lat: 53.7632, lng: -2.7031 },
  { name: 'Blackpool', lat: 53.8175, lng: -3.0357 },
  { name: 'Burnley', lat: 53.7893, lng: -2.2485 },
  { name: 'Huddersfield', lat: 53.6450, lng: -1.7850 },
  { name: 'Halifax', lat: 53.7213, lng: -1.8614 },
]

function getRandomLocation() {
  const city = faker.helpers.arrayElement(nwEnglandCities)
  // Add some random variation (±0.05 degrees ~ 5km)
  const lat = city.lat + (faker.number.float({ min: -0.05, max: 0.05 }))
  const lng = city.lng + (faker.number.float({ min: -0.05, max: 0.05 }))
  return {
    location: city.name,
    latitude: lat,
    longitude: lng,
  }
}

function generateBio() {
  const templates = [
    "Passionate about {hobby} and always up for an adventure. Looking for someone who shares my love for {interest} and good conversations.",
    "{job} by day, {hobby} enthusiast by night. Seeking a genuine connection with someone who appreciates {interest}.",
    "Love exploring {place} and trying new {food}. My ideal match is someone who can make me laugh and enjoys {activity}.",
    "Based in {location}, I spend my free time {hobby}. I'm looking for someone kind, ambitious, and who loves {interest}.",
    "{personality} and {personality}, I enjoy {activity} and {food}. Let's connect if you're into {interest}!",
  ]

  const hobbies = ['photography', 'cooking', 'traveling', 'reading', 'gaming', 'music', 'art', 'dancing', 'hiking', 'yoga']
  const interests = ['deep conversations', 'spontaneous trips', 'trying new restaurants', 'movie nights', 'outdoor activities', 'learning new things']
  const places = ['local cafes', 'hidden gems', 'nature trails', 'city markets', 'cozy pubs']
  const foods = ['craft beer', 'fine wine', 'street food', 'home cooking', 'desserts']
  const activities = ['live music', 'board games', 'dancing', 'sports', 'volunteering']
  const personalities = ['adventurous', 'creative', 'ambitious', 'kind-hearted', 'funny', 'intelligent', 'outgoing', 'thoughtful']
  const jobs = ['designer', 'developer', 'teacher', 'nurse', 'artist', 'writer', 'chef', 'entrepreneur']

  const template = faker.helpers.arrayElement(templates)
  return template
    .replace('{hobby}', faker.helpers.arrayElement(hobbies))
    .replace('{interest}', faker.helpers.arrayElement(interests))
    .replace('{place}', faker.helpers.arrayElement(places))
    .replace('{food}', faker.helpers.arrayElement(foods))
    .replace('{activity}', faker.helpers.arrayElement(activities))
    .replace('{personality}', faker.helpers.arrayElement(personalities))
    .replace('{job}', faker.helpers.arrayElement(jobs))
    .replace('{location}', faker.helpers.arrayElement(nwEnglandCities).name)
}

function generatePromptAnswer(question: string) {
  const answers = {
    'My simple pleasures': [
      'A perfect cup of coffee on a quiet morning',
      'Walking barefoot in the grass',
      'Reading a good book with a cup of tea',
      'Cooking a meal from scratch',
      'Watching the sunset',
    ],
    'A life goal of mine': [
      'Travel to every continent',
      'Start my own business',
      'Write a book',
      'Learn to speak another language fluently',
      'Run a marathon',
    ],
    'I geek out on': [
      'True crime documentaries',
      'Space exploration',
      'Vintage cars',
      'Board games',
      'Cooking techniques',
    ],
    'My most controversial opinion': [
      'Pineapple belongs on pizza',
      'Cats are better than dogs',
      'Marvel is better than DC',
      'Taylor Swift is overrated',
      'Social media is ruining society',
    ],
    'Don\'t hate me if I': [
      'Put ketchup on everything',
      'Sing along to songs loudly',
      'Correct your grammar',
      'Eat dessert before dinner',
      'Talk to my plants',
    ],
    'The way to win me over is': [
      'Make me laugh',
      'Cook me dinner',
      'Plan a surprise adventure',
      'Listen attentively',
      'Send thoughtful messages',
    ],
    'I\'m looking for': [
      'Someone who makes me smile',
      'A genuine connection',
      'My partner in crime',
      'Someone to grow with',
      'Adventure and stability',
    ],
    'The best way to ask me out': [
      'Be confident but not arrogant',
      'Plan something thoughtful',
      'Keep it simple and genuine',
      'Make it personal',
      'Show you\'ve been paying attention',
    ],
    'My love language is': [
      'Quality time',
      'Words of affirmation',
      'Physical touch',
      'Acts of service',
      'Receiving gifts',
    ],
    'First date idea': [
      'Coffee and a walk in the park',
      'Dinner at a cozy restaurant',
      'A museum or art gallery',
      'Hiking or outdoor activity',
      'Cooking class together',
    ],
    'I\'m a regular at': [
      'My local coffee shop',
      'The gym',
      'Bookstores',
      'Live music venues',
      'Farmers markets',
    ],
    'My go-to karaoke song': [
      'Don\'t Stop Believin\' by Journey',
      'Bohemian Rhapsody by Queen',
      'Wonderwall by Oasis',
      'Respect by Aretha Franklin',
      'Sweet Caroline by Neil Diamond',
    ],
    'The key to my heart': [
      'Honesty and loyalty',
      'Sense of humor',
      'Kindness',
      'Ambition',
      'Good communication',
    ],
    'I\'m weirdly attracted to': [
      'People who read books',
      'Good handwriting',
      'People who can cook',
      'Accent pronunciation',
      'Organized planners',
    ],
    'My ideal Sunday': [
      'Brunch with friends',
      'Lazy morning in bed',
      'Hiking in nature',
      'Reading all day',
      'Trying a new recipe',
    ],
    'Green flags I look for': [
      'Good communication',
      'Respect for boundaries',
      'Sense of humor',
      'Emotional intelligence',
      'Kindness to others',
    ],
    'My self-care routine': [
      'Morning meditation',
      'Bubble baths',
      'Reading before bed',
      'Regular exercise',
      'Journaling',
    ],
    'A random fact I love': [
      'Octopuses have three hearts',
      'A group of flamingos is called a flamboyance',
      'Honey never spoils',
      'Bananas are berries',
      'Sharks have been around longer than trees',
    ],
    'I\'m convinced that': [
      'Everything happens for a reason',
      'The universe is listening',
      'Kindness is contagious',
      'Life is too short not to try',
      'Music can heal anything',
    ],
    'Two truths and a lie': [
      'I once met a celebrity',
      'I can speak three languages',
      'I\'ve been skydiving',
      'I hate chocolate',
      'I\'ve run a marathon',
    ],
    'I want someone who': [
      'Makes me feel safe',
      'Challenges me to grow',
      'Shares my values',
      'Can make me laugh',
      'Is kind and respectful',
    ],
    'My most irrational fear': [
      'Clowns',
      'Spiders',
      'Flying',
      'The dark',
      'Public speaking',
    ],
    'Unusual skills': [
      'I can tie a cherry stem with my tongue',
      'I can recite pi to 50 digits',
      'I can juggle',
      'I can solve a Rubik\'s cube',
      'I can speak backwards',
    ],
    'I recently discovered': [
      'A new favorite author',
      'Meditation apps',
      'A great hiking trail',
      'Vintage shopping',
      'Plant-based cooking',
    ],
    'My travel story': [
      'Got lost in Tokyo and found the best ramen',
      'Hiked Machu Picchu at sunrise',
      'Danced all night in Rio',
      'Found love in Paris',
      'Survived a safari in Africa',
    ],
    'Change my mind about': [
      'Social media isn\'t all bad',
      'Pineapple on pizza is delicious',
      'Cats can be affectionate',
      'Exercise can be fun',
      'Vegans can eat good food',
    ],
    'Together we could': [
      'Travel the world',
      'Start a business',
      'Learn a new skill',
      'Build something amazing',
      'Create lasting memories',
    ],
    'I\'m actually really good at': [
      'Making people laugh',
      'Giving advice',
      'Remembering details',
      'Cooking comfort food',
      'Finding the best deals',
    ],
    'Last great book I read': [
      'The Midnight Library by Matt Haig',
      'Atomic Habits by James Clear',
      'The Seven Husbands of Evelyn Hugo',
      'Educated by Tara Westover',
      'Where the Crawdads Sing',
    ],
  }

  return faker.helpers.arrayElement(answers[question as keyof typeof answers] || ['Something interesting about me'])
}

async function generateFakeUsers(count: number = 100, genderDistribution: { male: number, trans: number } = { male: 80, trans: 20 }) {
  console.log(`🚀 Generating ${count} fake users (${genderDistribution.male} male, ${genderDistribution.trans} trans)...`)

  const interestList = await prisma.interest.findMany({
    select: { id: true, name: true },
  })
  const promptList = await prisma.prompt.findMany({
    select: { id: true, question: true },
  })

  const passwordHash = await hashPassword('Password123!')

  const users = []
  const totalMale = genderDistribution.male
  const totalTrans = genderDistribution.trans

  for (let i = 0; i < count; i++) {
    // Determine gender for this user
    let gender: 'MAN' | 'NON_BINARY'
    let fakerGender: 'male' | 'female'
    
    if (i < totalMale) {
      gender = 'MAN'
      fakerGender = 'male'
    } else {
      gender = 'NON_BINARY' // Using NON_BINARY for trans users
      fakerGender = faker.helpers.arrayElement(['male', 'female']) // Mix for trans users
    }

    const firstName = faker.person.firstName(fakerGender)
    const lastName = faker.person.lastName()
    const displayName = firstName
    const email = faker.internet.email({ firstName, lastName }).toLowerCase()

    const birthYear = faker.number.int({ min: 1985, max: 2000 })
    const birthMonth = faker.number.int({ min: 1, max: 12 })
    const birthDay = faker.number.int({ min: 1, max: 28 })
    const dateOfBirth = new Date(birthYear, birthMonth - 1, birthDay)

    const { location, latitude, longitude } = getRandomLocation()

    const bio = generateBio()

    const jobTitles = ['Software Developer', 'Designer', 'Teacher', 'Nurse', 'Artist', 'Writer', 'Chef', 'Entrepreneur', 'Marketing Manager', 'Accountant', 'Doctor', 'Lawyer', 'Photographer', 'Journalist', 'Architect', 'Engineer', 'Consultant', 'Manager', 'Analyst', 'Therapist']
    const companies = ['TechCorp', 'Design Studio', 'Local School', 'City Hospital', 'Art Gallery', 'Publishing House', 'Restaurant Chain', 'Startup Inc', 'Marketing Agency', 'Consulting Firm', 'Medical Center', 'Law Firm', 'Photo Studio', 'News Outlet', 'Architecture Firm', 'Tech Solutions', 'Digital Agency', 'Healthcare Ltd', 'Creative Studios']
    const schools = ['University of Manchester', 'University of Liverpool', 'University of Leeds', 'University of Sheffield', 'Newcastle University', 'University of Birmingham', 'Local College', 'Community College', 'Technical Institute', 'Art School']

    // Adjust height based on gender
    const heightRange = gender === 'MAN' ? { min: 165, max: 195 } : { min: 150, max: 185 }
    const height = faker.number.int(heightRange)

    const user = {
      email,
      phoneNumber: faker.phone.number(),
      passwordHash,
      firstName,
      lastName,
      displayName,
      dateOfBirth,
      gender,
      interestedIn: faker.helpers.arrayElements(['MAN', 'WOMAN', 'NON_BINARY'], { min: 1, max: 3 }),
      bio,
      jobTitle: faker.helpers.arrayElement(jobTitles),
      company: faker.helpers.maybe(() => faker.helpers.arrayElement(companies)),
      school: faker.helpers.maybe(() => faker.helpers.arrayElement(schools)),
      height,
      location,
      latitude,
      longitude,
      maxDistance: faker.number.int({ min: 10, max: 100 }),
      ageMin: faker.number.int({ min: 18, max: 25 }),
      ageMax: faker.number.int({ min: 30, max: 50 }),
      showMe: faker.helpers.arrayElement(['MAN', 'WOMAN', 'EVERYONE']),
      isVerified: faker.datatype.boolean({ probability: 0.3 }),
      isEmailVerified: true,
      isPhoneVerified: faker.datatype.boolean({ probability: 0.8 }),
      isActive: true,
      showDistance: true,
      showAge: true,
      incognitoMode: false,
      lastActive: new Date(),
    }

    users.push(user)

    if ((i + 1) % 50 === 0) {
      console.log(`Generated ${i + 1} users...`)
    }
  }

  console.log('📝 Creating users in database...')

  for (let i = 0; i < users.length; i++) {
    const userData = users[i]

    try {
      const user = await prisma.user.create({
        data: userData,
      })

      // Generate photos (3-6 photos per user)
      const photoCount = faker.number.int({ min: 3, max: 6 })
      const photos = []

      for (let j = 0; j < photoCount; j++) {
        const width = faker.number.int({ min: 600, max: 800 })
        const height = faker.number.int({ min: 800, max: 1200 })
        const photoUrl = `https://picsum.photos/${width}/${height}?random=${faker.string.uuid()}`

        photos.push({
          userId: user.id,
          url: photoUrl,
          order: j,
          isPrimary: j === 0,
          isVerified: faker.datatype.boolean({ probability: 0.7 }),
        })
      }

      await prisma.photo.createMany({
        data: photos,
      })

      // Generate interests (3-8 random interests)
      const userInterests = faker.helpers.arrayElements(
        interestList,
        { min: 3, max: 8 }
      ).map(interest => ({
        userId: user.id,
        interestId: interest.id,
      }))

      await prisma.userInterest.createMany({
        data: userInterests,
      })

      // Generate prompt answers (2-4 random prompts)
      const userPrompts = faker.helpers.arrayElements(
        promptList,
        { min: 2, max: 4 }
      ).map(prompt => ({
        userId: user.id,
        promptId: prompt.id,
        answer: generatePromptAnswer(prompt.question),
      }))

      await prisma.userPrompt.createMany({
        data: userPrompts,
      })

      if ((i + 1) % 50 === 0) {
        console.log(`Created ${i + 1} users in database...`)
      }

    } catch (error) {
      console.error(`Error creating user ${i + 1}:`, error)
    }
  }

  console.log(`✅ Successfully created ${count} fake female users!`)
}

async function main() {
  try {
    await generateFakeUsers(100, { male: 80, trans: 20 })
  } catch (error) {
    console.error('Error generating fake users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()