'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface UserProfile {
  name: string
  age: number
  email: string
  bio: string
  location: string
  gender: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    bio: '',
    location: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setFormData({
          bio: data.profile.bio || '',
          location: data.profile.location || '',
        })
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchProfile()
        setEditing(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl">Profile not found</div>
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
              onClick={() => router.push('/matches')}
              className="px-4 py-2 text-gray-700 hover:text-wedate-pink"
            >
              Matches
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-red-600 hover:text-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Profile */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="h-64 bg-gradient-to-br from-wedate-pink to-wedate-purple flex items-center justify-center text-white text-8xl">
              {profile.name[0]}
            </div>
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    {profile.name}, {profile.age}
                  </h2>
                  <p className="text-gray-600">{profile.email}</p>
                  <p className="text-gray-600">Gender: {profile.gender}</p>
                </div>
                <button
                  onClick={() => setEditing(!editing)}
                  className="px-4 py-2 bg-wedate-pink text-white rounded-lg hover:bg-opacity-90"
                >
                  {editing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Bio</label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wedate-pink"
                      rows={4}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wedate-pink"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="City, Country"
                    />
                  </div>

                  <button
                    onClick={handleUpdate}
                    className="w-full px-4 py-3 bg-gradient-to-r from-wedate-pink to-wedate-purple text-white font-semibold rounded-lg hover:opacity-90"
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {profile.location && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-1">Location</h3>
                      <p className="text-gray-600">📍 {profile.location}</p>
                    </div>
                  )}
                  
                  {profile.bio && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-1">About</h3>
                      <p className="text-gray-600">{profile.bio}</p>
                    </div>
                  )}

                  {!profile.bio && !profile.location && (
                    <p className="text-gray-500 italic">
                      Click "Edit" to complete your profile
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
