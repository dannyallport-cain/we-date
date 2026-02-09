import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { email: true, id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find Stripe customer by email
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    })

    if (customers.data.length === 0) {
      return NextResponse.json({ error: 'Stripe customer not found' }, { status: 404 })
    }

    const customer = customers.data[0]

    // Create Portal Session
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings`,
    })

    return NextResponse.json({ url: session.url })

  } catch (error) {
    console.error('Portal session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
