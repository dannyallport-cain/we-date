'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import toast from 'react-hot-toast'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  originalPrice?: number
  period: string
  savings?: string
  features: string[]
  popular?: boolean
}

const PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 9.99,
    period: 'month',
    features: [
      'Unlimited likes',
      '5 Super Likes per week',
      '1 Boost per month',
      'Rewind (undo) swipes',
      'See who liked you',
      'Premium badge',
      'Incognito mode',
      'Advanced filters',
      'Read receipts',
      'Priority support',
    ],
  },
  {
    id: 'threeMonths',
    name: '3 Months',
    price: 24.99,
    originalPrice: 29.97,
    period: '3 months',
    savings: 'Save 17%',
    features: [
      'Everything in Monthly',
      'Best value option',
      'Cancel anytime',
    ],
    popular: true,
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 59.99,
    originalPrice: 119.88,
    period: 'year',
    savings: 'Save 50%',
    features: [
      'Everything in Monthly',
      'Maximum savings',
      'Premium support',
    ],
  },
]

export default function PremiumPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      try {
        const res = await fetch('/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        }
      } catch (e) {
        console.error(e)
      }
    }
    
    fetchUser()
  }, [router])

  const handleManageSubscription = async () => {
      setIsLoading('portal')
      try {
          const token = localStorage.getItem('token')
          const res = await fetch('/api/subscription/portal', {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` }
          })
          if (!res.ok) throw new Error('Failed to get portal URL')
          const { url } = await res.json()
          window.location.href = url
      } catch (e) {
          toast.error('Could not access billing portal')
      } finally {
          setIsLoading(null)
      }
  }

  const handleSubscribe = async (planId: string) => {
    setIsLoading(planId)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login to continue')
        router.push('/auth/login')
        return
      }

      // Map plan IDs to Stripe price IDs
      // Update: We now send the plan ID directly to the API which handles the mapping
      
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create subscription')
      }

      const { url } = await response.json()

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (error) {
      console.error('Subscription error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to start subscription')
    } finally {
      setIsLoading(null)
    }
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/swipe')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-purple-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {user?.isPremium ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-6 text-white shadow-lg">
               <span className="text-4xl">👑</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">You're a Premium Member!</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
              Your subscription is active. You have access to unlimited likes, rewind, boosts, and more!
            </p>
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-[2px] rounded-xl inline-block">
              <button 
                  onClick={handleManageSubscription}
                  disabled={!!isLoading}
                  className="bg-white text-gray-900 px-8 py-3 rounded-[10px] font-bold hover:bg-gray-50 transition-colors"
               >
                 {isLoading === 'portal' ? 'Loading Portal...' : 'Manage Subscription / Billing'}
               </button>
            </div>
          </div>
        ) : (
          <>
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-6">
            <span className="text-2xl">⭐</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upgrade to Premium
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get unlimited access to the best features and find your perfect match faster
          </p>
        </div>

        {/* Key Features Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
            <div className="text-3xl mb-3">⭐</div>
            <h3 className="font-semibold text-gray-900 mb-2">Unlimited Likes</h3>
            <p className="text-sm text-gray-600">Like as many profiles as you want, no daily limits</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
            <div className="text-3xl mb-3">👀</div>
            <h3 className="font-semibold text-gray-900 mb-2">See Who Liked You</h3>
            <p className="text-sm text-gray-600">Find people who are already interested in you</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
            <div className="text-3xl mb-3">↩️</div>
            <h3 className="font-semibold text-gray-900 mb-2">Rewind Swipes</h3>
            <p className="text-sm text-gray-600">Undo your last swipe if you change your mind</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="font-semibold text-gray-900 mb-2">Profile Boost</h3>
            <p className="text-sm text-gray-600">Get more visibility and matches in your area</p>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                plan.popular ? 'ring-2 ring-pink-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">/{plan.period.replace(' ', '')}</span>
                </div>
                {plan.originalPrice && (
                  <div className="text-sm text-gray-500 line-through">
                    ${plan.originalPrice}
                  </div>
                )}
                {plan.savings && (
                  <div className="text-sm text-green-600 font-semibold">
                    {plan.savings}
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isLoading === plan.id}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading === plan.id ? 'Processing...' : `Get ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
        </>
        )}

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-12">
          <div className="grid md:grid-cols-3 divide-x divide-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Feature</h3>
              <div className="space-y-4">
                <p className="text-gray-700 font-medium">Likes per day</p>
                <p className="text-gray-700 font-medium">Super Likes</p>
                <p className="text-gray-700 font-medium">See Who Liked You</p>
                <p className="text-gray-700 font-medium">Rewind Swipes</p>
                <p className="text-gray-700 font-medium">Profile Boosts</p>
                <p className="text-gray-700 font-medium">Premium Badge</p>
                <p className="text-gray-700 font-medium">Incognito Mode</p>
                <p className="text-gray-700 font-medium">Advanced Filters</p>
                <p className="text-gray-700 font-medium">Priority Support</p>
              </div>
            </div>
            <div className="p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Free</h3>
              <div className="space-y-4">
                <p className="text-gray-600">20</p>
                <p className="text-gray-600">0</p>
                <p className="text-red-500">✗</p>
                <p className="text-red-500">✗</p>
                <p className="text-red-500">✗</p>
                <p className="text-red-500">✗</p>
                <p className="text-red-500">✗</p>
                <p className="text-red-500">✗</p>
                <p className="text-red-500">✗</p>
              </div>
            </div>
            <div className="p-6 bg-gradient-to-b from-pink-50 to-purple-50">
              <h3 className="text-lg font-semibold text-pink-600 mb-6">👑 Premium</h3>
              <div className="space-y-4">
                <p className="text-green-600 font-semibold">Unlimited</p>
                <p className="text-green-600 font-semibold">5/week</p>
                <p className="text-green-600">✓</p>
                <p className="text-green-600">✓</p>
                <p className="text-green-600">✓</p>
                <p className="text-green-600">✓</p>
                <p className="text-green-600">✓</p>
                <p className="text-green-600">✓</p>
                <p className="text-green-600">✓</p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            What Premium Members Say
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400">⭐⭐⭐⭐⭐</div>
              </div>
              <p className="text-gray-700 mb-4">
                "The unlimited likes feature changed everything for me. I found my girlfriend in just 2 weeks!"
              </p>
              <p className="font-semibold text-gray-900">Sarah, 26</p>
              <p className="text-sm text-gray-600">Los Angeles, CA</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400">⭐⭐⭐⭐⭐</div>
              </div>
              <p className="text-gray-700 mb-4">
                "Seeing who liked me first saved so much time. I connected with my partner right away!"
              </p>
              <p className="font-semibold text-gray-900">Michael, 28</p>
              <p className="text-sm text-gray-600">New York, NY</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400">⭐⭐⭐⭐⭐</div>
              </div>
              <p className="text-gray-700 mb-4">
                "The profile boost helped me get 10x more matches. Premium is totally worth it!"
              </p>
              <p className="font-semibold text-gray-900">Jessica, 24</p>
              <p className="text-sm text-gray-600">Austin, TX</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. You'll continue to have premium access until the end of your billing period.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens to my likes when I cancel?
              </h3>
              <p className="text-gray-600">
                When your premium subscription expires, you'll return to the free tier with limited likes per day. Your existing matches remain active.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We offer refunds within 7 days of purchase if you're not satisfied with the premium features. Contact our support team for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}