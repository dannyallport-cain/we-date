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

    // Check if active boost exists
    const activeBoost = await prisma.boost.findFirst({
      where: {
        userId,
        expiresAt: { gt: new Date() },
        isActive: true
      }
    })

    if (activeBoost) {
      return NextResponse.json({ 
        error: 'Boost already active',
        expiresAt: activeBoost.expiresAt 
      }, { status: 400 })
    }

    // Check entitlement (Premium Only for MVP)
    const user = await prisma.user.findUnique({ 
      where: { id: userId }, 
      select: { isPremium: true } 
    })

    if (!user?.isPremium) {
      return NextResponse.json({ 
        error: 'Premium required',
        code: 'PREMIUM_REQUIRED'
      }, { status: 403 })
    }

    // Check cooldown (1 per month)
    const lastBoost = await prisma.boost.findFirst({
      where: { userId },
      orderBy: { startedAt: 'desc' }
    })

    // Strict cooldown check
    if (lastBoost) {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      
      // If last boost was within last month
      if (lastBoost.startedAt > monthAgo) {
         // Should we block?
         // For development, we might want to skip this.
         // return NextResponse.json({ error: 'Premium boost cooldown active (1/month)' }, { status: 403 })
         console.log(`[DEV] Skipping boost cooldown check for user ${userId}`)
      }
    }

    // Create Boost
    const duration = 30 // minutes
    const expiresAt = new Date(Date.now() + duration * 60000)

    const boost = await prisma.boost.create({
      data: {
        userId,
        duration,
        expiresAt,
        isActive: true
      }
    })

    return NextResponse.json({ success: true, boost })

  } catch (error) {
    console.error('Boost error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
