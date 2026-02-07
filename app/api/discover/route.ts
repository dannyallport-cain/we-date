import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get auth token
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = payload.userId

    // Get current user's preferences
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        gender: true,
        interestedIn: true,
        showMe: true,
        ageMin: true,
        ageMax: true,
        latitude: true,
        longitude: true,
        maxDistance: true,
      }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get users already swiped on
    const swipedUserIds = await prisma.swipe.findMany({
      where: { userId },
      select: { targetUserId: true }
    })

    const excludedIds = [userId, ...swipedUserIds.map(s => s.targetUserId)]

    // Calculate age range
    const today = new Date()
    const maxBirthDate = new Date(today.getFullYear() - currentUser.ageMin, today.getMonth(), today.getDate())
    const minBirthDate = new Date(today.getFullYear() - currentUser.ageMax - 1, today.getMonth(), today.getDate())

    // Build query filters
    const genderFilter = currentUser.showMe === 'EVERYONE' 
      ? {}
      : { gender: currentUser.showMe }

    // Get potential matches
    const users = await prisma.user.findMany({
      where: {
        id: { notIn: excludedIds },
        isActive: true,
        deletedAt: null,
        dateOfBirth: {
          gte: minBirthDate,
          lte: maxBirthDate,
        },
        ...genderFilter,
        photos: {
          some: {} // Has at least one photo
        }
      },
      select: {
        id: true,
        displayName: true,
        dateOfBirth: true,
        bio: true,
        location: true,
        jobTitle: true,
        company: true,
        school: true,
        height: true,
        photos: {
          orderBy: { order: 'asc' },
          select: {
            url: true,
            order: true,
          }
        },
        interests: {
          select: {
            interest: {
              select: {
                name: true,
                icon: true,
              }
            }
          },
          take: 10
        },
        prompts: {
          select: {
            answer: true,
            prompt: {
              select: {
                question: true,
              }
            }
          },
          take: 3
        }
      },
      take: 20, // Get 20 potential matches
      orderBy: {
        lastActive: 'desc' // Prioritize active users
      }
    })

    // TODO: Implement distance filtering based on latitude/longitude
    // TODO: Implement recommendation algorithm based on interests, activity, etc.

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Discover error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
