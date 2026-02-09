import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

// Helper to get stripe client
const getStripeClient = (client?: any) => {
  const s = client || stripe
  if (!s) throw new Error('Stripe not configured')
  return s
}

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session, stripeClient?: any) {
  const userId = session.metadata?.userId
  if (!userId) return

  // Get subscription details
  if (session.subscription) {
    let subscription: Stripe.Subscription
    
    // Check if subscription is already expanded or just an ID
    if (typeof session.subscription === 'string') {
        const s = getStripeClient(stripeClient)
        subscription = await s.subscriptions.retrieve(session.subscription)
    } else {
        subscription = session.subscription as Stripe.Subscription
    }

    // Calculate premium expiration date
    const currentPeriodEnd = (subscription as any)['current_period_end'] as number
    const premiumUntil = new Date(currentPeriodEnd * 1000)

    // Update user as premium
    await prisma.user.update({
      where: { id: userId },
      data: {
        isPremium: true,
        premiumUntil,
      },
    })

    console.log(`User ${userId} upgraded to premium until ${premiumUntil}`)
    return premiumUntil
  }
}

export async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, stripeClient?: any) {
  // Handle both expanded and ID references
  const invoiceData = invoice as any
  const subscriptionId = typeof invoiceData.subscription === 'string' 
    ? invoiceData.subscription 
    : (invoiceData.subscription as Stripe.Subscription)?.id

  if (subscriptionId) {
    const s = getStripeClient(stripeClient)
    const subscription = await s.subscriptions.retrieve(subscriptionId)
    const userId = subscription.metadata?.userId

    if (userId) {
      // Extend premium subscription
      const currentPeriodEnd = (subscription as any)['current_period_end'] as number
      const premiumUntil = new Date(currentPeriodEnd * 1000)

      await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: true,
          premiumUntil,
        },
      })

      console.log(`User ${userId} premium subscription renewed until ${premiumUntil}`)
      return premiumUntil
    }
  }
}

export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, stripeClient?: any) {
  const invoiceData = invoice as any
  const subscriptionId = typeof invoiceData.subscription === 'string' 
    ? invoiceData.subscription 
    : (invoiceData.subscription as Stripe.Subscription)?.id

  if (subscriptionId) {
    const s = getStripeClient(stripeClient)
    const subscription = await s.subscriptions.retrieve(subscriptionId)
    const userId = subscription.metadata?.userId

    if (userId) {
      // Could send notification to user about payment failure
      console.log(`Payment failed for user ${userId}`)
    }
  }
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId

  if (userId) {
    // Remove premium status
    await prisma.user.update({
      where: { id: userId },
      data: {
        isPremium: false,
        premiumUntil: null,
      },
    })

    console.log(`User ${userId} premium subscription cancelled`)
    return true
  }
}
