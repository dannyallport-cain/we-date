import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const userId = decoded.userId

    // Find swipes where I am the target, and action is LIKE or SUPER_LIKE
    // And exclude users I have already swiped on (PASS, LIKE, SUPER_LIKE)
    // because if I liked them back, it's a Match (handled elsewhere). 
    // If I passed them, they shouldn't show in "Likes You" anymore (or maybe they should? Tinder removes them, but allows seeing them in Gold list? No, usually once you swipe left they are gone).
    
    // So: Incoming Likes from users I have NOT swiped on yet.

    const incomingLikes = await prisma.swipe.findMany({
      where: {
        targetUserId: userId,
        action: { in: ['LIKE', 'SUPER_LIKE'] },
        user: {
           // Exclude users blocked by me? 
           blockedBy: {
             none: {
               userId: userId
             }
           },
           // Exclude users who I have already swiped on
           receivedSwipes: {
             none: {
                userId: userId
             }
           }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            dateOfBirth: true, // to calc age
            photos: {
               select: {
                 url: true,
                 isPrimary: true
               },
               orderBy: {
                 isPrimary: 'desc'
               },
               take: 1
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Formatting
    const likes = incomingLikes.map(swipe => {
      const u = swipe.user
      const age = new Date().getFullYear() - new Date(u.dateOfBirth).getFullYear() 
      return {
        id: u.id,
        displayName: u.displayName,
        age: age,
        photo: u.photos[0]?.url || '/placeholder.jpg',
        isSuperLike: swipe.action === 'SUPER_LIKE',
        likedAt: swipe.createdAt
      }
    })

    return NextResponse.json({ likes })

  } catch (error) {
    console.error('Error fetching likes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
