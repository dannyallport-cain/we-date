'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SwipeCard from '@/components/SwipeCard'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'

interface User {
  id: string
  displayName: string
  dateOfBirth: Date
  bio?: string
  location?: string
  jobTitle?: string
  company?: string
  photos: { url: string; order: number }[]
  interests?: { interest: { name: string; icon?: string } }[]
}

export default function SwipePage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [matchNotification, setMatchNotification] = useState(false)
  const [matchedUser, setMatchedUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const response = await fetch('/api/discover', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else if (response.status === 401) {
        router.push('/auth/login')
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching users:', error)
      setLoading(false)
    }
  }

  const handleSwipe = async (direction: 'left' | 'right' | 'up') => {
    const currentUser = users[currentIndex]
    if (!currentUser) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/swipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetUserId: currentUser.id,
          action: direction === 'left' ? 'PASS' : direction === 'up' ? 'SUPER_LIKE' : 'LIKE',
        }),
      })

      const data = await response.json()

      if (data.matched) {
        setMatchedUser(currentUser)
        setMatchNotification(true)
        setTimeout(() => setMatchNotification(false), 3000)
      }

      setCurrentIndex(currentIndex + 1)

      // Fetch more users if running low
      if (currentIndex >= users.length - 2) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Error swiping:', error)
      setCurrentIndex(currentIndex + 1)
    }
  }

  const triggerSwipe = (direction: 'left' | 'right' | 'up') => {
    handleSwipe(direction)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary-500 border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Finding great matches...</p>
        </div>
      </div>
    )
  }

  const currentUser = users[currentIndex]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar 
        rightAction={
          <button className="text-2xl hover:scale-110 active:scale-95 transition-transform">
            ⚙️
          </button>
        }
      />

      <main className="pt-16 pb-4 px-0 h-screen max-w-screen-sm mx-auto">
        {/* Card Stack */}
        <div className="relative h-[calc(100vh-180px)]">
          {currentUser ? (
            <>
              {/* Next card (preview) */}
              {users[currentIndex + 1] && (
                <div className="absolute inset-4 scale-95 opacity-50 pointer-events-none">
                  <div className="h-full w-full rounded-3xl shadow-xl bg-white overflow-hidden">
                    <img
                      src={users[currentIndex + 1].photos[0]?.url || '/placeholder-profile.jpg'}
                      alt="Next profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Current card */}
              <SwipeCard
                user={currentUser}
                onSwipe={handleSwipe}
                onCardClick={() => router.push(`/profile/${currentUser.id}`)}
              />
            </>
          ) : (
            <div className="absolute inset-4 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  You're all caught up!
                </h2>
                <p className="text-gray-600 mb-6">
                  Check back later for more profiles
                </p>
                <button
                  onClick={() => router.push('/matches')}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:shadow-glow active:scale-95 transition-all duration-200"
                >
                  View Matches
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {currentUser && (
          <div className="flex justify-center items-center gap-4 px-4 mt-4">
            <button
              onClick={() => triggerSwipe('left')}
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl active:scale-90 transition-all duration-200 bg-white border-2 border-red-500 text-red-500 hover:bg-red-50"
              aria-label="Pass"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <button
              onClick={() => triggerSwipe('up')}
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl active:scale-90 transition-all duration-200 bg-white border-2 border-blue-500 text-blue-500 hover:bg-blue-50 text-2xl"
              aria-label="Super Like"
            >
              ⭐
            </button>
            
            <button
              onClick={() => triggerSwipe('right')}
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl active:scale-90 transition-all duration-200 bg-gradient-to-br from-primary-500 to-accent-500 text-white"
              aria-label="Like"
            >
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </main>

      <BottomNav />

      {/* Match Notification */}
      {matchNotification && matchedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center animate-scale-in shadow-2xl">
            <div className="text-6xl mb-4 animate-bounce-subtle">🎉</div>
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
              It's a Match!
            </h2>
            <p className="text-gray-600 mb-6">
              You and {matchedUser.displayName} liked each other
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setMatchNotification(false)}
                className="flex-1 bg-white text-primary-600 font-semibold py-3 px-6 rounded-full border-2 border-primary-500 hover:bg-primary-50 active:scale-95 transition-all duration-200"
              >
                Keep Swiping
              </button>
              <button
                onClick={() => router.push('/matches')}
                className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:shadow-glow active:scale-95 transition-all duration-200"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
