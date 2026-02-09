'use client'

import { useRouter } from 'next/navigation'

interface PremiumPaywallProps {
  featureName: string
  featureEmoji?: string
  onClose?: () => void
  compact?: boolean
}

export default function PremiumPaywall({ featureName, featureEmoji = '⭐', onClose, compact = false }: PremiumPaywallProps) {
  const router = useRouter()

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 text-sm font-medium text-pink-700">
        <span>{featureEmoji}</span>
        <span>Premium Feature</span>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm mx-auto text-center animate-scale-in shadow-2xl">
        {/* Icon */}
        <div className="text-6xl mb-6 inline-block">{featureEmoji}</div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Unlock {featureName}
        </h2>

        {/* Description */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          Go Premium to access {featureName} and enjoy unlimited likes, boosts, and more premium features!
        </p>

        {/* Features List */}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-4 mb-6 space-y-2 text-left">
          <div className="flex items-center gap-3">
            <span className="text-lg">⭐</span>
            <span className="text-sm text-gray-700">{featureName} & more premium features</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg">💬</span>
            <span className="text-sm text-gray-700">Unlimited likes & super likes</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg">🚀</span>
            <span className="text-sm text-gray-700">Profile boosts & priority visibility</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg">👑</span>
            <span className="text-sm text-gray-700">Premium badge on your profile</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Starting from</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-bold text-gray-900">$9.99</span>
            <span className="text-gray-600">/month</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Cancel anytime</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 flex-col">
          <button
            onClick={() => router.push('/premium')}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200"
          >
            Go Premium Now
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-full hover:bg-gray-200 transition-colors duration-200"
            >
              Not Now
            </button>
          )}
        </div>

        {/* Close button for modal */}
        {!onClose && (
          <button
            onClick={() => router.back()}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
