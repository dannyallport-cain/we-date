import { NextRequest, NextResponse } from 'next/server'
import { query, initDatabase } from '@/lib/db'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Initialize database if needed
    await initDatabase()

    const { email, password, name, age, gender } = await request.json()

    // Validate input
    if (!email || !password || !name || !age || !gender) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const result = await query(
      'INSERT INTO users (email, password_hash, name, age, gender) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [email, passwordHash, name, age, gender]
    )

    const userId = result.rows[0].id

    // Generate token
    const token = generateToken(userId)

    return NextResponse.json({ token, userId })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
