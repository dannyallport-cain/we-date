'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  name: string
  age: number
  bio: string
  location: string
  photos: string[]
}

export default function SwipePage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [matchNotification, setMatchNotification] = useState(false)

  useEffect(() => {
    fetchNextUser()
  }, [])

  const fetchNextUser = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const response = await fetch('/api/users/next', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentUser(data.user)
      } else {
        setCurrentUser(null)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching user:', error)
      setLoading(false)
    }
  }

  const handleSwipe = async (liked: boolean) => {
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
          liked,
        }),
      })

      const data = await response.json()

      if (data.matched) {
        setMatchNotification(true)
        setTimeout(() => setMatchNotification(false), 3000)
      }

      fetchNextUser()
    } catch (error) {
      console.error('Error swiping:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-wedate-pink">💕 WeDate</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/matches')}
              className="px-4 py-2 text-gray-700 hover:text-wedate-pink"
            >
              Matches
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="px-4 py-2 text-gray-700 hover:text-wedate-pink"
            >
              Profile
            </button>
          </div>
        </div>
      </nav>

      {/* Match notification */}
      {matchNotification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg">
          🎉 It's a match!
        </div>
      )}

      {/* Card */}
      <div className="container mx-auto px-4 py-8 flex justify-center">
        {currentUser ? (
          <div className="relative w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="h-96 bg-gradient-to-br from-wedate-pink to-wedate-purple flex items-center justify-center text-white text-6xl">
                {currentUser.name[0]}
              </div>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {currentUser.name}, {currentUser.age}
                </h2>
                {currentUser.location && (
                  <p className="text-gray-600 mb-4">📍 {currentUser.location}</p>
                )}
                {currentUser.bio && (
                  <p className="text-gray-700 mb-4">{currentUser.bio}</p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-center gap-6 mt-6">
              <button
                onClick={() => handleSwipe(false)}
                className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-3xl hover:scale-110 transition-transform"
              >
                ❌
              </button>
              <button
                onClick={() => handleSwipe(true)}
                className="w-16 h-16 bg-wedate-pink rounded-full shadow-lg flex items-center justify-center text-3xl hover:scale-110 transition-transform"
              >
                ❤️
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No more profiles
            </h2>
            <p className="text-gray-600">Check back later for more matches!</p>
          </div>
        )}
      </div>
    </main>
  )
}
