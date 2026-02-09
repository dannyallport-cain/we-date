import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isPremium: true }
    })

    if (!user?.isPremium) {
      return NextResponse.json({ 
        error: 'Premium required to rewind',
        code: 'PREMIUM_REQUIRED' 
      }, { status: 403 })
    }

    // Find last swipe
    const lastSwipe = await prisma.swipe.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    if (!lastSwipe) {
      return NextResponse.json({ error: 'No swipe to rewind' }, { status: 404 })
    }

    // Execute deletion in transaction
    await prisma.$transaction(async (tx) => {
      // 1. Delete the swipe
      await tx.swipe.delete({
        where: { id: lastSwipe.id }
      })

      // 2. Check for match and delete if exists
      // Determine user1Id and user2Id sequence
      const u1 = userId < lastSwipe.targetUserId ? userId : lastSwipe.targetUserId
      const u2 = userId < lastSwipe.targetUserId ? lastSwipe.targetUserId : userId
      
      const match = await tx.match.findUnique({
        where: {
          user1Id_user2Id: { user1Id: u1, user2Id: u2 }
        }
      })
      
      if (match) {
        await tx.match.delete({
          where: { id: match.id }
        })
        
        // Note: Notifications might remain. It's complex to find exact notification to delete without ID.
        // But invalid notifications usually aren't critical blockers.
      }
    })

    return NextResponse.json({ 
      success: true, 
      rewoundSwipe: {
        id: lastSwipe.id,
        targetUserId: lastSwipe.targetUserId,
        action: lastSwipe.action
      }
    })

  } catch (error) {
    console.error('Rewind error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
