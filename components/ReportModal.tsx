'use client'

import { useState } from 'react'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  userName: string
  onReport: (reason: string) => Promise<void>
}

const REPORT_REASONS = [
  { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate content' },
  { value: 'FAKE_PROFILE', label: 'Fake profile' },
  { value: 'HARASSMENT', label: 'Harassment or bullying' },
  { value: 'SPAM', label: 'Spam or unwanted messages' },
  { value: 'UNDERAGE', label: 'Underage user' },
  { value: 'STOLEN_PHOTOS', label: 'Stolen photos' },
  { value: 'SCAM', label: 'Scam or fraud' },
  { value: 'OTHER', label: 'Other' },
]

export default function ReportModal({ isOpen, onClose, userId, userName, onReport }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!selectedReason) {
      setError('Please select a reason for reporting')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await onReport(selectedReason)
      onClose()
      // Could show a success toast here
    } catch (err) {
      setError('Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-md mx-4 w-full animate-scale-in shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Report {userName}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Help us keep WeDate safe by reporting inappropriate behavior or content.
        </p>

        <div className="space-y-3 mb-6">
          {REPORT_REASONS.map((reason) => (
            <label key={reason.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="report-reason"
                value={reason.value}
                checked={selectedReason === reason.value}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-4 h-4 text-primary-500 border-gray-300 focus:ring-primary-500"
              />
              <span className="text-gray-700">{reason.label}</span>
            </label>
          ))}
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
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
            className="flex-1 bg-red-500 text-white font-semibold py-3 px-4 rounded-full hover:bg-red-600 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Reporting...' : 'Report'}
          </button>
        </div>
      </div>
    </div>
  )
}