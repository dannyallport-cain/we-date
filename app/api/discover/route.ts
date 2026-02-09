import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { calculateDistance, formatDistance } from '@/lib/location'

// Helper function to calculate profile completeness score (0-100)
function calculateProfileCompleteness(user: any): number {
  let score = 0;
  const maxScore = 100;

  // Photos (30 points)
  const photoCount = user.photos?.length || 0;
  score += Math.min(photoCount * 10, 30);

  // Bio (20 points)
  if (user.bio && user.bio.trim().length > 10) score += 20;

  // Job/Company (15 points)
  if (user.jobTitle || user.company) score += 15;

  // Interests (15 points)
  const interestCount = user.interests?.length || 0;
  score += Math.min(interestCount * 3, 15);

  // Prompts (10 points)
  const promptCount = user.prompts?.length || 0;
  score += Math.min(promptCount * 3.33, 10);

  // Location (10 points)
  if (user.location) score += 10;

  return Math.round(score);
}

// Helper function to calculate shared interests
function calculateSharedInterests(userInterests: string[], currentUserInterests: string[]): number {
  const userInterestNames = userInterests.map(i => i.toLowerCase());
  const currentInterestNames = currentUserInterests.map(i => i.toLowerCase());
  return userInterestNames.filter(interest => currentInterestNames.includes(interest)).length;
}

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
    const url = new URL(request.url)
    const expandDistance = url.searchParams.get('expandDistance') === 'true'

    // Get current user's preferences and interests
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
        interests: {
          select: {
            interest: {
              select: { name: true }
            }
          }
        }
      }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Extract current user's interest names for matching
    const currentUserInterests = currentUser.interests.map(i => i.interest.name);

    // Get users already swiped on
    const swipedUserIds = await prisma.swipe.findMany({
      where: { userId },
      select: { targetUserId: true }
    })

    // Get users blocked by current user
    const blockedUserIds = await prisma.block.findMany({
      where: { userId },
      select: { blockedUserId: true }
    })

    // Get users reported by current user (exclude from discovery)
    const reportedUserIds = await prisma.report.findMany({
      where: { reporterId: userId },
      select: { reportedUserId: true }
    })

    const excludedIds = [
      userId, 
      ...swipedUserIds.map(s => s.targetUserId),
      ...blockedUserIds.map(b => b.blockedUserId),
      ...reportedUserIds.map(r => r.reportedUserId)
    ]

    // Calculate date for inactive users (30+ days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

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
        lastActive: {
          gte: thirtyDaysAgo, // Exclude users inactive for 30+ days
        },
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
        isPremium: true,
        lastActive: true,
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
        },
        boosts: {
          where: {
            isActive: true,
            expiresAt: { gt: new Date() }
          },
          take: 1
        }
      },
      take: 100, // Get more users for better scoring and filtering
      orderBy: {
        lastActive: 'desc' // Initial sort by activity
      }
    })

    // Enhanced scoring and filtering
    const usersWithScoring = users
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

        // Calculate profile completeness
        const profileCompleteness = calculateProfileCompleteness(user);

        // Calculate shared interests
        const userInterestNames = user.interests.map(i => i.interest.name);
        const sharedInterests = calculateSharedInterests(userInterestNames, currentUserInterests);

        // Calculate activity score (0-100 based on last active)
        const daysSinceActive = Math.floor((today.getTime() - new Date(user.lastActive).getTime()) / (1000 * 60 * 60 * 24));
        const activityScore = Math.max(0, 100 - daysSinceActive * 3); // Decay 3 points per day

        // Calculate overall match score
        let matchScore = 0;
        
        // Verification bonus (20 points)
        if (user.isVerified) matchScore += 20;
        
        // Profile completeness bonus (up to 20 points)
        matchScore += Math.floor(profileCompleteness / 5);
        
        // Shared interests bonus (up to 30 points)
        matchScore += sharedInterests * 6;
        
        // Activity bonus (up to 20 points)
        matchScore += Math.floor(activityScore / 5);
        
        // Distance penalty (closer is better, up to -10 points for far users)
        if (distance !== null && currentUser.maxDistance) {
          const distanceRatio = distance / currentUser.maxDistance;
          if (distanceRatio > 1) matchScore -= 10;
          else if (distanceRatio > 0.5) matchScore -= 5;
        }

        const isBoosted = (user as any).boosts && (user as any).boosts.length > 0;

        return {
          ...user,
          isBoosted,
          age,
          distance,
          distanceFormatted,
          profileCompleteness,
          sharedInterests,
          activityScore,
          matchScore,
        };
      })
      .filter((user) => {
        // Filter by max distance if set and both users have coordinates
        if (
          currentUser.maxDistance &&
          user.distance !== null
        ) {
          // Use expanded distance if requested (double the max distance)
          const effectiveMaxDistance = expandDistance ? currentUser.maxDistance * 2 : currentUser.maxDistance;
          return user.distance <= effectiveMaxDistance;
        }
        // Include users without distance if maxDistance not set or coordinates missing
        return true;
      })
      .sort((a, b) => {
        // Super Priority: Boosted users
        if (a.isBoosted && !b.isBoosted) return -1;
        if (!a.isBoosted && b.isBoosted) return 1;

        // Primary sort: Higher match score first
        if (a.matchScore !== b.matchScore) {
          return b.matchScore - a.matchScore;
        }
        
        // Secondary sort: Verified users first
        if (a.isVerified && !b.isVerified) return -1;
        if (!a.isVerified && b.isVerified) return 1;
        
        // Tertiary sort: Distance (closer first)
        if (a.distance !== null && b.distance !== null) {
          return a.distance - b.distance;
        }
        
        // Users without distance come last
        if (a.distance !== null) return -1;
        if (b.distance !== null) return 1;
        
        // Final sort: Most recently active
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
      })
      .slice(0, 20); // Limit to 20 users

    return NextResponse.json({ users: usersWithScoring })
  } catch (error) {
    console.error('Discover error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
