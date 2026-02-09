import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { stripe, PREMIUM_PRICES, getSubscriptionDuration } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }
  try {
    // Get auth token
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { priceId, plan } = await req.json()

    let selectedPriceId = priceId
    if (plan && PREMIUM_PRICES[plan as keyof typeof PREMIUM_PRICES]) {
      selectedPriceId = PREMIUM_PRICES[plan as keyof typeof PREMIUM_PRICES]
    }

    if (!selectedPriceId || !Object.values(PREMIUM_PRICES).includes(selectedPriceId)) {
      return NextResponse.json({ error: 'Invalid price ID or plan' }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, isPremium: true, premiumUntil: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user already has active premium
    if (user.isPremium && user.premiumUntil && user.premiumUntil > new Date()) {
      return NextResponse.json({ error: 'User already has active premium subscription' }, { status: 400 })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        priceId: selectedPriceId,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
        },
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Create subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}