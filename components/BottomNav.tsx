'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Discover', href: '/swipe', icon: '🔥' },
  { name: 'Matches', href: '/matches', icon: '💬' },
  { name: 'Profile', href: '/profile', icon: '👤' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 to-gray-800 border-t border-gray-700 safe-area-inset z-50 shadow-2xl">
      <div className="max-w-screen-sm mx-auto flex items-center justify-around px-6 py-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'text-primary-500 scale-110 bg-white/10 backdrop-blur-sm' 
                  : 'text-gray-300 hover:text-white active:scale-95'
              }`}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
