import 'dotenv/config'
import { prisma } from '../lib/prisma'
import { handleCheckoutCompleted, handleSubscriptionDeleted } from '../lib/subscription'

// const prisma = new PrismaClient() Remove this line

async function main() {
  console.log('🧪 Starting subscription flow test...')

  // 1. Create Test User
  const testEmail = `test-sub-${Date.now()}@example.com`
  console.log(`👤 Creating test user: ${testEmail}`)
  
  const user = await prisma.user.create({
    data: {
      email: testEmail,
      displayName: 'Test Subscribe User',
      firstName: 'Test',
      passwordHash: 'placeholder',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'MAN', 
      interestedIn: ['WOMAN'],
      isPremium: false,
      premiumUntil: null,
    }
  })

  console.log(`✅ User created with ID: ${user.id}`)

  try {
    // 2. Mock Stripe Client
    const mockStripe = {
      subscriptions: {
        retrieve: async (id: string) => {
          return {
            id,
            current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
            metadata: {
              userId: user.id
            }
          }
        }
      }
    }

    // 3. Test Checkout Completion
    console.log('💳 Testing Checkout Completion...')
    const mockSession = {
      metadata: { userId: user.id },
      subscription: 'sub_test_123'
    }

    // @ts-ignore - passing mock session
    await handleCheckoutCompleted(mockSession, mockStripe)

    // Verify DB update
    const upgradedUser = await prisma.user.findUnique({ where: { id: user.id } })
    
    if (upgradedUser?.isPremium && upgradedUser.premiumUntil) {
      console.log('✅ User successfully upgraded to Premium!')
      console.log(`   Premium Until: ${upgradedUser.premiumUntil}`)
    } else {
      throw new Error('❌ User was NOT upgraded to Premium')
    }

    // 4. Test Subscription Cancellation
    console.log('🛑 Testing Subscription Cancellation...')
    const mockSubscription = {
      metadata: { userId: user.id }
    }

    // @ts-ignore - passing mock subscription
    await handleSubscriptionDeleted(mockSubscription)

    // Verify DB update
    const downgradedUser = await prisma.user.findUnique({ where: { id: user.id } })
    
    if (!downgradedUser?.isPremium && !downgradedUser?.premiumUntil) {
      console.log('✅ User successfully downgraded from Premium!')
    } else {
      throw new Error('❌ User was NOT downgraded')
    }

    console.log('🎉 Subscription flow test passed successfully!')

  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  } finally {
    // Cleanup
    console.log('🧹 Cleaning up test user...')
    await prisma.user.delete({ where: { id: user.id } })
    await prisma.$disconnect()
  }
}

main()
