import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Get token from header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const userId = decoded.userId
    const { targetUserId, action } = await request.json()

    // Validate action
    if (!['LIKE', 'PASS', 'SUPER_LIKE'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Record swipe
    await prisma.swipe.upsert({
      where: {
        userId_targetUserId: {
          userId,
          targetUserId
        }
      },
      update: {
        action
      },
      create: {
        userId,
        targetUserId,
        action
      }
    })

    // If super like, create notification
    if (action === 'SUPER_LIKE') {
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          type: 'SUPER_LIKE',
          title: 'Someone Super Liked you!',
          message: 'You got a Super Like! Check it out.',
          data: { fromUserId: userId }
        }
      })
    }

    // Check for match if liked or super liked
    let matched = false
    if (action === 'LIKE' || action === 'SUPER_LIKE') {
      // Check if target user also liked this user
      const reciprocalSwipe = await prisma.swipe.findUnique({
        where: {
          userId_targetUserId: {
            userId: targetUserId,
            targetUserId: userId
          }
        }
      })

      if (reciprocalSwipe && (reciprocalSwipe.action === 'LIKE' || reciprocalSwipe.action === 'SUPER_LIKE')) {
        matched = true

        // Create match (ensure user1Id < user2Id for consistency)
        const user1Id = userId < targetUserId ? userId : targetUserId
        const user2Id = userId < targetUserId ? targetUserId : userId

        await prisma.match.upsert({
          where: {
            user1Id_user2Id: {
              user1Id,
              user2Id
            }
          },
          update: {},
          create: {
            user1Id,
            user2Id
          }
        })

        // Create match notifications for both users
        await prisma.notification.createMany({
          data: [
            {
              userId,
              type: 'NEW_MATCH',
              title: "It's a Match!",
              message: 'You matched with someone!',
              data: { matchedUserId: targetUserId }
            },
            {
              userId: targetUserId,
              type: 'NEW_MATCH',
              title: "It's a Match!",
              message: 'You matched with someone!',
              data: { matchedUserId: userId }
            }
          ]
        })
      }
    }

    return NextResponse.json({ success: true, matched })
  } catch (error) {
    console.error('Swipe error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
