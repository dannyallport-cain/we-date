'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Match {
  id: number
  userId: number
  name: string
  age: number
  bio: string
}

export default function MatchesPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const response = await fetch('/api/matches', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMatches(data.matches)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching matches:', error)
      setLoading(false)
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
              onClick={() => router.push('/swipe')}
              className="px-4 py-2 text-gray-700 hover:text-wedate-pink"
            >
              Swipe
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

      {/* Matches */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Matches</h2>
        
        {matches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💔</div>
            <p className="text-gray-600 text-xl">No matches yet</p>
            <button
              onClick={() => router.push('/swipe')}
              className="mt-4 px-6 py-3 bg-wedate-pink text-white rounded-full hover:bg-opacity-90"
            >
              Start Swiping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <div
                key={match.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => {/* Navigate to chat */}}
              >
                <div className="h-48 bg-gradient-to-br from-wedate-pink to-wedate-purple flex items-center justify-center text-white text-5xl">
                  {match.name[0]}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {match.name}, {match.age}
                  </h3>
                  {match.bio && (
                    <p className="text-gray-600 text-sm line-clamp-2">{match.bio}</p>
                  )}
                  <button className="mt-4 w-full px-4 py-2 bg-wedate-pink text-white rounded-lg hover:bg-opacity-90">
                    💬 Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
