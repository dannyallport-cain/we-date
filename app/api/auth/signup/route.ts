import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, dateOfBirth, gender, interestedIn } = await request.json()

    // Validate input
    if (!email || !password || !firstName || !dateOfBirth || !gender) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate age (must be 18+)
    const birthDate = new Date(dateOfBirth)
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    
    if (age < 18) {
      return NextResponse.json(
        { error: 'You must be at least 18 years old' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user with Prisma
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        displayName: firstName, // Can be updated later
        dateOfBirth: new Date(dateOfBirth),
        gender: gender.toUpperCase(),
        interestedIn: interestedIn ? [interestedIn.toUpperCase()] : ['EVERYONE'],
        showMe: 'EVERYONE',
      },
    })

    // Generate token
    const token = generateToken(user.id)

    return NextResponse.json({ 
      token, 
      userId: user.id,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      }
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
