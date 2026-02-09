
import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function main() {
  console.log('🧪 Starting "Who Liked Me" test...')
  
  const timestamp = Date.now()
  const emailMe = `me-${timestamp}@example.com`
  
  // 1. Create "Me" (Free)
  const me = await prisma.user.create({
    data: {
      email: emailMe,
      passwordHash: 'hash',
      firstName: 'Me',
      displayName: 'Me',
      dateOfBirth: new Date('1995-01-01'),
      gender: 'MAN',
      interestedIn: ['WOMAN'],
      isPremium: false
    }
  })
  console.log(`👤 Created Me: ${me.id} (Free)`)

  // 2. Create Fan B
  const fanB = await prisma.user.create({
    data: {
      email: `fanB-${timestamp}@example.com`,
      passwordHash: 'hash',
      firstName: 'Fan',
      lastName: 'B',
      displayName: 'Fan B',
      dateOfBirth: new Date('1998-01-01'),
      gender: 'WOMAN',
      interestedIn: ['MAN']
    }
  })
  console.log(`👤 Created Fan B: ${fanB.id}`)

  // 3. Create Fan C
  const fanC = await prisma.user.create({
    data: {
      email: `fanC-${timestamp}@example.com`,
      passwordHash: 'hash',
      firstName: 'Fan', // Required field
      lastName: 'C',
      displayName: 'Fan C',
      dateOfBirth: new Date('1999-01-01'),
      gender: 'WOMAN',
      interestedIn: ['MAN']
    }
  })
  console.log(`👤 Created Fan C: ${fanC.id}`)

  // 4. Swipes
  console.log('❤️ Fans swiping right on Me...')
  await prisma.swipe.create({
    data: { userId: fanB.id, targetUserId: me.id, action: 'LIKE' }
  })
  await prisma.swipe.create({
    data: { userId: fanC.id, targetUserId: me.id, action: 'SUPER_LIKE' }
  })

  // 5. Test Logic (Free)
  console.log('🔍 Querying Liked Me (Free mode)...')
  const pendingLikes = await prisma.swipe.findMany({
      where: {
        targetUserId: me.id,
        action: { in: ['LIKE', 'SUPER_LIKE'] },
        user: {
          receivedSwipes: {
            none: {
              userId: me.id
            }
          }
        }
      },
      include: {
        user: {
          select: { displayName: true }
        }
      }
    })
    
  if (pendingLikes.length === 2) {
      console.log('✅ Found 2 pending likes.')
  } else {
      console.error(`❌ Expected 2 pending likes, found ${pendingLikes.length}`)
  }

  // Simulate API response for Free
  const freeResponse = pendingLikes.map(swipe => ({
        id: 'HIDDEN',
        displayName: 'Someone',
        isSuperLike: swipe.action === 'SUPER_LIKE'
  }))
  console.log('   API Response (Free):', JSON.stringify(freeResponse, null, 2))
  
  // 6. Upgrade to Premium
  console.log('⬆️ Upgrading Me to Premium...')
  await prisma.user.update({
      where: { id: me.id },
      data: { isPremium: true }
  })
  
  // 7. Test Logic (Premium)
  console.log('🔍 Querying Liked Me (Premium mode)...')
  // Query is same, but response mapping differs
  const premiumResponse = pendingLikes.map(swipe => ({
      id: swipe.userId,
      displayName: swipe.user.displayName,
      isSuperLike: swipe.action === 'SUPER_LIKE'
  }))
  console.log('   API Response (Premium):', JSON.stringify(premiumResponse, null, 2))
  
  if (premiumResponse[0].displayName.includes('Fan')) {
       console.log('✅ Premium sees names.')
  }

  // Cleanup
  console.log('🧹 Cleanup...')
  await prisma.user.deleteMany({
      where: {
          id: { in: [me.id, fanB.id, fanC.id] }
      }
  })
  await prisma.$disconnect()
}

main()
