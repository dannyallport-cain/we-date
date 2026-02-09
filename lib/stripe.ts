import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

const createStripeClient = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is required')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-01-28.clover',
  })
}

export const getStripe = () => {
  if (!stripeInstance) {
    stripeInstance = createStripeClient()
  }
  return stripeInstance
}

// For backward compatibility - only create if env var exists
export const stripe = process.env.STRIPE_SECRET_KEY ? getStripe() : null as any

export const PREMIUM_PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY || '',
  threeMonths: process.env.STRIPE_PRICE_3MONTHS || '',
  yearly: process.env.STRIPE_PRICE_YEARLY || '',
}

export const PREMIUM_FEATURES = {
  unlimitedLikes: true,
  superLikesPerWeek: 5,
  boostsPerMonth: 1,
  rewindEnabled: true,
  seeWhoLikedYou: true,
  premiumBadge: true,
  incognitoMode: true,
  advancedFilters: true,
  readReceipts: true,
  prioritySupport: true,
}

export function getSubscriptionDuration(priceId: string): number {
  if (priceId === PREMIUM_PRICES.yearly) return 365
  if (priceId === PREMIUM_PRICES.threeMonths) return 90
  return 30 // monthly
}