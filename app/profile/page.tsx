'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import PhotoUploader from '@/components/PhotoUploader'

interface UserProfile {
  id: string
  displayName: string
  firstName: string
  dateOfBirth: Date
  age: number
  email: string
  bio?: string
  location?: string
  gender: string
  jobTitle?: string
  company?: string
  photos: { url: string; order: number }[]
  interests: { interest: { name: string; icon?: string } }[]
  prompts: { prompt: { text: string }; response: string }[]
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    jobTitle: '',
    company: '',
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
          jobTitle: data.profile.jobTitle || '',
          company: data.profile.company || '',
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

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/swipe')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary-500 border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile not found</h2>
          <button
            onClick={() => router.push('/auth/login')}
            className="text-primary-600 font-semibold hover:text-primary-700"
          >
            Go to login
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-100 to-purple-100 pb-20">
      {/* Header with Back Button */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-800">My Profile</h1>
          <div className="w-10"></div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-2xl mt-14">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="h-64 bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center text-white text-8xl font-bold">
            {profile.displayName?.[0]?.toUpperCase() || profile.firstName?.[0]?.toUpperCase() || '?'}
          </div>
          
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-1">
                  {profile.displayName}, {profile.age}
                </h2>
                <p className="text-gray-600 text-sm mb-2">{profile.email}</p>
                {profile.jobTitle && (
                  <p className="text-gray-700 font-medium">
                    {profile.jobTitle}{profile.company ? ` at ${profile.company}` : ''}
                  </p>
                )}
                <p className="text-gray-500 text-sm mt-1">
                  {profile.gender === 'MAN' ? 'Man' : profile.gender === 'WOMAN' ? 'Woman' : 'Non-binary'}
                </p>
              </div>
              <button
                onClick={() => setEditing(!editing)}
                className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-full hover:shadow-lg active:scale-95 transition-all"
              >
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editing ? (
              <div className="space-y-6">
                {/* Photo Upload Section */}
                <div>
                  <PhotoUploader />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Bio</label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900"
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Location</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Job Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="Product Manager"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Company</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Tech Company"
                  />
                </div>

                <button
                  onClick={handleUpdate}
                  className="w-full px-4 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold rounded-xl shadow-lg hover:shadow-glow active:scale-95 transition-all"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {profile.location && (
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <span className="text-xl">📍</span> Location
                    </h3>
                    <p className="text-gray-600">{profile.location}</p>
                  </div>
                )}
                
                {profile.bio && (
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <span className="text-xl">✨</span> About
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                {profile.interests && profile.interests.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="text-xl">❤️</span> Interests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((item, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-gradient-to-r from-primary-50 to-accent-50 text-primary-700 rounded-full text-sm font-medium border border-primary-200"
                        >
                          {item.interest.icon} {item.interest.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.prompts && profile.prompts.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="text-xl">💭</span> My Vibes
                    </h3>
                    <div className="space-y-3">
                      {profile.prompts.map((item, index) => (
                        <div key={index} className="bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-700 font-medium mb-1">{item.prompt.text}</p>
                          <p className="text-gray-900">{item.response}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!profile.bio && !profile.location && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Complete your profile to get more matches!</p>
                    <button
                      onClick={() => setEditing(true)}
                      className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-full shadow-lg hover:shadow-glow active:scale-95 transition-all"
                    >
                      Get Started
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="w-full max-w-2xl mx-auto block px-4 py-3 bg-white text-red-600 font-semibold rounded-xl border-2 border-red-600 hover:bg-red-50 active:scale-95 transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
