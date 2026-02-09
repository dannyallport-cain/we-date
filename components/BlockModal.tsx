'use client'

import { useState } from 'react'

interface BlockModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  userName: string
  onBlock: () => Promise<void>
}

export default function BlockModal({ isOpen, onClose, userId, userName, onBlock }: BlockModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleBlock = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      await onBlock()
      onClose()
      // Could show a success toast here
    } catch (err) {
      setError('Failed to block user. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-md mx-4 w-full animate-scale-in shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Block {userName}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">What happens when you block someone?</h3>
              <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                <li>• They won't see your profile</li>
                <li>• You won't see their profile</li>
                <li>• Any existing matches will be removed</li>
                <li>• You can unblock them later in settings</li>
              </ul>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-full hover:bg-gray-200 active:scale-95 transition-all duration-200"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleBlock}
            className="flex-1 bg-red-500 text-white font-semibold py-3 px-4 rounded-full hover:bg-red-600 active:scale-95 transition-all duration-200"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Blocking...' : 'Block User'}
          </button>
        </div>
      </div>
    </div>
  )
}