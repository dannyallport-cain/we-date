import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { calculateDistance, formatDistance } from '@/lib/location'

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
        latitude: true,
        longitude: true,
        jobTitle: true,
        company: true,
        school: true,
        height: true,
        isVerified: true,
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
      take: 50, // Get more users for distance filtering
      orderBy: {
        lastActive: 'desc' // Prioritize active users
      }
    })

    // Filter by distance and calculate distance for each user
    const usersWithDistance = users
      .map((user) => {
        // Calculate distance if both users have coordinates
        let distance: number | null = null;
        let distanceFormatted: string | null = null;

        if (
          currentUser.latitude &&
          currentUser.longitude &&
          user.latitude &&
          user.longitude
        ) {
          distance = calculateDistance(
            { latitude: currentUser.latitude, longitude: currentUser.longitude },
            { latitude: user.latitude, longitude: user.longitude }
          );
          distanceFormatted = formatDistance(distance);
        }

        // Calculate age
        const age = Math.floor(
          (today.getTime() - new Date(user.dateOfBirth).getTime()) / 
          (365.25 * 24 * 60 * 60 * 1000)
        );

        return {
          ...user,
          age,
          distance,
          distanceFormatted,
        };
      })
      .filter((user) => {
        // Filter by max distance if set and both users have coordinates
        if (
          currentUser.maxDistance &&
          user.distance !== null
        ) {
          return user.distance <= currentUser.maxDistance;
        }
        // Include users without distance if maxDistance not set or coordinates missing
        return true;
      })
      .sort((a, b) => {
        // Prioritize verified users
        if (a.isVerified && !b.isVerified) return -1;
        if (!a.isVerified && b.isVerified) return 1;
        
        // Then by distance (closer first)
        if (a.distance !== null && b.distance !== null) {
          return a.distance - b.distance;
        }
        
        // Users without distance come last
        if (a.distance !== null) return -1;
        if (b.distance !== null) return 1;
        
        return 0;
      })
      .slice(0, 20); // Limit to 20 users

    return NextResponse.json({ users: usersWithDistance })
  } catch (error) {
    console.error('Discover error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
