import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
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
    const { targetUserId, liked } = await request.json()

    // Record swipe
    await query(
      'INSERT INTO swipes (user_id, target_user_id, liked) VALUES ($1, $2, $3) ON CONFLICT (user_id, target_user_id) DO UPDATE SET liked = $3',
      [userId, targetUserId, liked]
    )

    // Check for match if liked
    let matched = false
    if (liked) {
      const reciprocalSwipe = await query(
        'SELECT liked FROM swipes WHERE user_id = $1 AND target_user_id = $2',
        [targetUserId, userId]
      )

      if (reciprocalSwipe.rows.length > 0 && reciprocalSwipe.rows[0].liked) {
        matched = true

        // Create match
        const user1Id = Math.min(userId, targetUserId)
        const user2Id = Math.max(userId, targetUserId)

        await query(
          'INSERT INTO matches (user1_id, user2_id) VALUES ($1, $2) ON CONFLICT (user1_id, user2_id) DO NOTHING',
          [user1Id, user2Id]
        )
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
