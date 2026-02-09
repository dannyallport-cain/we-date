
import 'dotenv/config'
import { prisma } from '../lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import { checkDailySwipeLimit, FREE_LIKES_LIMIT } from '../lib/limits'

// Initialize Prisma
// const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Starting swipe limit test...')
  
  const email = `test-limit-${Date.now()}@example.com`
  const passwordHash = 'hash'
  
  // 1. Create a non-premium user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: 'Limit',
      lastName: 'Tester',
      displayName: 'LimitTester',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'MAN',
      interestedIn: ['WOMAN'],
      maxDistance: 50,
      ageMin: 18,
      ageMax: 50,
      showMe: 'WOMAN',
      isPremium: false
    }
  })
  console.log(`👤 Created user: ${user.id}`)

  try {
    // 2. Simulate likes
    console.log(`🔄 performing ${FREE_LIKES_LIMIT} likes...`)
    
    // We can't easily call the API route, so we will use the lib function directly
    // But verify the lib function reflects what the API would do.
    // However, the lib function calculates remaining based on DB state.
    // So we need to insert Swipes into the DB.
    
    for (let i = 0; i < FREE_LIKES_LIMIT; i++) {
        const targetId = `target-${i}-${uuidv4()}` // Fake ID is fine for the Swipe record
        // We technically need the target user to exist for the foreign key constraint?
        // Let's check schema. Relation is:
        // user        User      @relation("SwipeSender", fields: [userId], references: [id], onDelete: Cascade)
        // targetUser  User      @relation("SwipeReceiver", fields: [targetUserId], references: [id], onDelete: Cascade)
        
        // YES, foreign key constraint exists. So we must create target users.
        // Creating 20 users is heavy. 
        // Maybe we just create ONE target user and delete the swipe record? 
        // No, we need COUNT of swipes today.
        // So we need 20 distinctive swipes.
        // Can we swipe the SAME user 20 times? 
        // Schema: @@unique([userId, targetUserId])
        // No, must be unique target users.
        
        // Okay, create 21 target users? That's slow.
        // Wait, maybe I can just manually insert swip records without creating users if I disable FK checks? No, prisma enforces it.
        // I have to create dummy users.
        
        const target = await prisma.user.create({
             data: {
                email: `target-${i}-${Date.now()}@example.com`,
                passwordHash: 'hash',
                firstName: 'Target',
                lastName: `${i}`,
                displayName: `Target ${i}`,
                dateOfBirth: new Date('1990-01-01'),
                gender: 'WOMAN',
                interestedIn: ['MAN'],
                maxDistance: 50,
                ageMin: 18,
                ageMax: 50,
                showMe: 'MAN',
             }
        })
        
        await prisma.swipe.create({
            data: {
                userId: user.id,
                targetUserId: target.id,
                action: 'LIKE'
            }
        })
    }
    
    console.log(`✅ ${FREE_LIKES_LIMIT} likes recorded.`)
    
    // 3. Check limit
    console.log('🔍 Checking limit status...')
    const status = await checkDailySwipeLimit(user.id)
    console.log(`Status: allowed=${status.allowed} remaining=${status.remaining}`)
    
    if (status.allowed === false && status.remaining === 0) {
        console.log('✅ Limit correctly reached.')
    } else {
        console.error('❌ Expected limit to be reached, but it was not.')
    }
    
    // 4. Upgrade to premium
    console.log('⬆️ Upgrading to Premium...')
    await prisma.user.update({
        where: { id: user.id },
        data: { isPremium: true, premiumUntil: new Date(Date.now() + 86400000) }
    })
    
    // 5. Check limit again
    const premiumStatus = await checkDailySwipeLimit(user.id)
    console.log(`Status after upgrade: allowed=${premiumStatus.allowed} isPremium=${premiumStatus.isPremium}`)
    
    if (premiumStatus.allowed === true && premiumStatus.isPremium === true) {
        console.log('✅ Premium bypass working.')
    } else {
        console.error('❌ Premium bypass failed.')
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    // Cleanup
    console.log('🧹 Cleaning up...')
    // Delete is cascade, so deleting user deletes swipes. But we created many target users.
    // We should delete them too.
    // We can filter by email pattern.
    
    await prisma.user.deleteMany({
        where: {
            OR: [
                { email: email },
                { email: { startsWith: 'target-' } }
            ]
        }
    })
    
    await prisma.$disconnect()
  }
}

main()
