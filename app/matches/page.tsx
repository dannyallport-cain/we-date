'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { format } from 'date-fns'
import BottomNav from '@/components/BottomNav'

interface Match {
  id: string
  user: {
    id: string
    displayName: string
    age: number
    bio: string | null
    photos: { url: string }[]
  }
  lastMessageAt: string | null
  lastMessage?: {
    content: string | null
    type: string
    senderId: string
  } | null
  unreadCount?: number
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
      <div className="min-h-screen bg-gradient-to-br from-red-100 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary-500 border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading matches...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-100 to-purple-100 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 text-white px-4 py-6 shadow-lg">
        <h1 className="text-2xl font-bold">Matches</h1>
        <p className="text-sm text-white/80 mt-1">
          {matches.length} {matches.length === 1 ? 'match' : 'matches'}
        </p>
      </div>

      {/* Matches List */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {matches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💔</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No matches yet</h2>
            <p className="text-gray-600 mb-6">Start swiping to find your perfect match!</p>
            <button
              onClick={() => router.push('/swipe')}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all"
            >
              Start Swiping
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => {
              const photo = match.user.photos[0];
              const lastMessage = match.lastMessage;
              const hasUnread = match.unreadCount && match.unreadCount > 0;

              return (
                <div
                  key={match.id}
                  onClick={() => router.push(`/messages/${match.id}`)}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
                >
                  <div className="flex items-center p-4 gap-4">
                    {/* Profile Photo */}
                    <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                      {photo ? (
                        <Image
                          src={photo.url}
                          alt={match.user.displayName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
                          {match.user.displayName[0]}
                        </div>
                      )}
                      {hasUnread && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {match.unreadCount}
                        </div>
                      )}
                    </div>

                    {/* Match Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {match.user.displayName}, {match.user.age}
                      </h3>
                      {lastMessage ? (
                        <p className={`text-sm truncate ${hasUnread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                          {lastMessage.type === 'IMAGE' ? '📷 Photo' : lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Say hi!</p>
                      )}
                    </div>

                    {/* Time */}
                    {match.lastMessageAt && (
                      <div className="text-xs text-gray-400">
                        {format(new Date(match.lastMessageAt), 'MMM d')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}
