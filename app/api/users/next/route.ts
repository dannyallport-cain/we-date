import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
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

    // Get next user that hasn't been swiped yet
    const result = await query(
      `SELECT u.id, u.name, u.age, u.bio, u.location, u.photos
       FROM users u
       WHERE u.id != $1
       AND u.id NOT IN (
         SELECT target_user_id FROM swipes WHERE user_id = $1
       )
       ORDER BY RANDOM()
       LIMIT 1`,
      [userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ user: result.rows[0] })
  } catch (error) {
    console.error('Get next user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
