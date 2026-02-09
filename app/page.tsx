'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const features = [
  {
    icon: '⚡',
    title: 'Smart Matching',
    description: 'Advanced algorithm finds your perfect match',
    color: 'from-yellow-400 to-orange-500',
  },
  {
    icon: '✨',
    title: 'Verified Profiles',
    description: 'Real people, verified identities',
    color: 'from-purple-400 to-pink-500',
  },
  {
    icon: '🔒',
    title: 'Safe & Secure',
    description: 'Your privacy is our priority',
    color: 'from-green-400 to-cyan-500',
  },
  {
    icon: '💬',
    title: 'Instant Chat',
    description: 'Connect with matches instantly',
    color: 'from-blue-400 to-indigo-500',
  },
]

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <main className="min-h-screen gradient-bg overflow-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center px-4 py-16">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className={`relative z-10 max-w-4xl mx-auto text-center transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* App Icon/Logo */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl shadow-2xl mb-8 animate-bounce-subtle">
            <span className="text-5xl">💕</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight">
            Find Your
            <span className="block mt-2 bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">
              Perfect Match
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join millions finding love, friendship, and meaningful connections on WeDate
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto px-10 py-4 bg-white text-primary-600 font-bold text-lg rounded-full hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl"
            >
              Create Account
            </Link>
            <Link
              href="/auth/login"
              className="w-full sm:w-auto px-10 py-4 bg-white/10 backdrop-blur-lg border-2 border-white text-white font-bold text-lg rounded-full hover:bg-white/20 active:scale-95 transition-all duration-200"
            >
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-20">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">2M+</div>
              <div className="text-sm text-white/80">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">500K+</div>
              <div className="text-sm text-white/80">Matches Daily</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">4.8★</div>
              <div className="text-sm text-white/80">App Rating</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
            Why Choose WeDate?
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            Experience dating reimagined with features designed for meaningful connections
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group p-8 rounded-3xl bg-gradient-to-br ${feature.color} hover:scale-105 transition-all duration-300 cursor-pointer`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/90">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="relative py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900">
            How It Works
          </h2>

          <div className="space-y-12">
            {[
              { step: '1', title: 'Create Your Profile', desc: 'Add photos, answer prompts, and showcase your personality', icon: '✨' },
              { step: '2', title: 'Discover Matches', desc: 'Swipe through profiles tailored to your preferences', icon: '🔥' },
              { step: '3', title: 'Connect & Chat', desc: 'Match with people who like you back and start chatting', icon: '💬' },
              { step: '4', title: 'Meet Up', desc: 'Take it offline and meet in person when you\'re ready', icon: '❤️' },
            ].map((item, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                  {item.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{item.icon}</span>
                    <h3 className="text-2xl font-bold text-gray-900">{item.title}</h3>
                  </div>
                  <p className="text-lg text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative py-20 px-4 gradient-bg">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Find Love?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Join WeDate today and start your journey to meaningful connections
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-12 py-5 bg-white text-primary-600 font-bold text-xl rounded-full hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl"
          >
            Get Started Free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold mb-4">About</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">Our Story</a></li>
              <li><a href="#" className="hover:text-white transition">Careers</a></li>
              <li><a href="#" className="hover:text-white transition">Press</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms</a></li>
              <li><a href="#" className="hover:text-white transition">Safety</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
              <li><a href="#" className="hover:text-white transition">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Follow Us</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">Instagram</a></li>
              <li><a href="#" className="hover:text-white transition">Twitter</a></li>
              <li><a href="#" className="hover:text-white transition">TikTok</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>© 2026 WeDate. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
