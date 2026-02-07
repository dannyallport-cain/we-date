'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    dateOfBirth: '',
    gender: '',
    interestedIn: '',
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        router.push('/profile')
      } else {
        setError(data.error || 'Signup failed')
      }
    } catch (err) {
      setError('Something went wrong')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md animate-slide-up">
        <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          Create Account
        </h1>
        <p className="text-gray-600 text-center mb-6">Join WeDate and start meeting amazing people</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">First Name</label>
            <input
              type="text"
              required
              placeholder="Your first name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              required
              placeholder="At least 8 characters"
              minLength={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Date of Birth</label>
            <input
              type="date"
              required
              max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
            <p className="text-sm text-gray-500 mt-1">You must be 18 or older</p>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">I am a</label>
            <select
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            >
              <option value="">Select your gender</option>
              <option value="MAN">Man</option>
              <option value="WOMAN">Woman</option>
              <option value="NON_BINARY">Non-binary</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Interested in</label>
            <select
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900"
              value={formData.interestedIn}
              onChange={(e) => setFormData({ ...formData, interestedIn: e.target.value })}
            >
              <option value="">Select preference</option>
              <option value="MAN">Men</option>
              <option value="WOMAN">Women</option>
              <option value="EVERYONE">Everyone</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-glow active:scale-95 transition-all duration-200 text-lg"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary-600 font-semibold hover:text-primary-700">
            Log In
          </Link>
        </p>
      </div>
    </main>
  )
}
