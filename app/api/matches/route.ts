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

    // Get matches
    const result = await query(
      `SELECT 
        m.id,
        CASE 
          WHEN m.user1_id = $1 THEN u2.id
          ELSE u1.id
        END as user_id,
        CASE 
          WHEN m.user1_id = $1 THEN u2.name
          ELSE u1.name
        END as name,
        CASE 
          WHEN m.user1_id = $1 THEN u2.age
          ELSE u1.age
        END as age,
        CASE 
          WHEN m.user1_id = $1 THEN u2.bio
          ELSE u1.bio
        END as bio
       FROM matches m
       JOIN users u1 ON m.user1_id = u1.id
       JOIN users u2 ON m.user2_id = u2.id
       WHERE m.user1_id = $1 OR m.user2_id = $1
       ORDER BY m.created_at DESC`,
      [userId]
    )

    return NextResponse.json({ matches: result.rows })
  } catch (error) {
    console.error('Get matches error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
