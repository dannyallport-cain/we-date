'use client'

import { useRouter } from 'next/navigation'

interface TopBarProps {
  title?: string
  showBack?: boolean
  rightAction?: React.ReactNode
}

export default function TopBar({ title, showBack, rightAction }: TopBarProps) {
  const router = useRouter()

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 border-b border-red-600 safe-area-inset z-50 shadow-lg">
      <div className="max-w-screen-sm mx-auto flex items-center justify-between px-4 py-3">
        <div className="w-10">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="text-white hover:text-red-100 active:scale-90 transition-transform"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>
        
        <h1 className="text-xl font-bold text-white drop-shadow-lg">
          {title || '💕 WeDate'}
        </h1>
        
        <div className="w-10 flex justify-end">
          {rightAction}
        </div>
      </div>
    </div>
  )
}
