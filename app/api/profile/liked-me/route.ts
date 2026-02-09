import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decoded.userId

    // Check if user is premium
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { isPremium: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find swipes where target is current user AND current user hasn't swiped back
    const pendingLikes = await prisma.swipe.findMany({
      where: {
        targetUserId: userId,
        action: { in: ['LIKE', 'SUPER_LIKE'] },
        user: {
          receivedSwipes: {
            none: {
              userId: userId
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            dateOfBirth: true,
            photos: {
              where: { isPrimary: true },
              select: { url: true }
            }
          }
        }
      }
    })

    // If premium, return full data
    if (currentUser.isPremium) {
      const users = pendingLikes.map(swipe => {
        const birthDate = new Date(swipe.user.dateOfBirth)
        const age = new Date().getFullYear() - birthDate.getFullYear()
        
        return {
          id: swipe.user.id,
          displayName: swipe.user.displayName,
          age,
          photo: swipe.user.photos[0]?.url || null,
          likedAt: swipe.createdAt,
          isSuperLike: swipe.action === 'SUPER_LIKE'
        }
      })
      return NextResponse.json({ count: users.length, users, isPremium: true })
    } else {
      // If free, return count and blurred/obfuscated data
      const users = pendingLikes.map(swipe => ({
        id: 'HIDDEN',
        displayName: 'Someone',
        age: 0, 
        photo: null, 
        likedAt: swipe.createdAt,
        isSuperLike: swipe.action === 'SUPER_LIKE'
      }))
      
      return NextResponse.json({ count: pendingLikes.length, users, isPremium: false })
    }

  } catch (error) {
    console.error('Liked Me error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
