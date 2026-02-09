import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
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

    // Get matches where user is either user1 or user2
    const matches = await prisma.match.findMany({
      where: {
        isActive: true,
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            displayName: true,
            dateOfBirth: true,
            bio: true,
            location: true,
            jobTitle: true,
            company: true,
            isVerified: true,
            isPremium: true,
            lastActive: true,
            photos: {
              where: { isPrimary: true },
              take: 1,
              select: {
                url: true
              }
            }
          }
        },
        user2: {
          select: {
            id: true,
            displayName: true,
            dateOfBirth: true,
            bio: true,
            location: true,
            jobTitle: true,
            company: true,
            isVerified: true,
            isPremium: true,
            lastActive: true,
            photos: {
              where: { isPrimary: true },
              take: 1,
              select: {
                url: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            content: true,
            createdAt: true,
            senderId: true,
            isRead: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform matches to always show the other user
    const transformedMatches = matches.map(match => {
      const otherUser = match.user1Id === userId ? match.user2 : match.user1
      const age = Math.floor((Date.now() - new Date(otherUser.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      const lastMessage = match.messages[0]

      return {
        matchId: match.id,
        user: {
          id: otherUser.id,
          displayName: otherUser.displayName,
          age,
          bio: otherUser.bio,
          location: otherUser.location,
          jobTitle: otherUser.jobTitle,
          company: otherUser.company,
          photoUrl: otherUser.photos[0]?.url || null,
          lastActive: otherUser.lastActive,
        },
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          isFromMe: lastMessage.senderId === userId,
          isRead: lastMessage.isRead
        } : null,
        matchedAt: match.createdAt
      }
    })

    return NextResponse.json({ matches: transformedMatches })
  } catch (error) {
    console.error('Get matches error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
