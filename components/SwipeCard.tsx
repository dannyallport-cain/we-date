'use client'

import { useState, useRef, useEffect } from 'react'

interface SwipeCardProps {
  user: {
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
  onSwipe: (direction: 'left' | 'right' | 'up') => void
  onCardClick?: () => void
}

export default function SwipeCard({ user, onSwipe, onCardClick }: SwipeCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)
  const startPosRef = useRef({ x: 0, y: 0 })

  const age = Math.floor((Date.now() - new Date(user.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  const photos = user.photos.sort((a, b) => a.order - b.order)

  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true)
    startPosRef.current = { x: clientX, y: clientY }
  }

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return

    const deltaX = clientX - startPosRef.current.x
    const deltaY = clientY - startPosRef.current.y

    setPosition({ x: deltaX, y: deltaY })
    setRotation(deltaX * 0.1)
  }

  const handleDragEnd = () => {
    setIsDragging(false)

    const threshold = 100
    const rotation = position.x * 0.1

    if (Math.abs(position.x) > threshold) {
      // Swipe left or right
      const direction = position.x > 0 ? 'right' : 'left'
      animateSwipeOut(direction)
    } else if (position.y < -threshold) {
      // Swipe up (super like)
      animateSwipeOut('up')
    } else {
      // Return to center
      setPosition({ x: 0, y: 0 })
      setRotation(0)
    }
  }

  const animateSwipeOut = (direction: 'left' | 'right' | 'up') => {
    const distance = window.innerWidth * 1.5
    
    let finalX = 0
    let finalY = 0

    if (direction === 'left') {
      finalX = -distance
    } else if (direction === 'right') {
      finalX = distance
    } else if (direction === 'up') {
      finalY = -distance
    }

    setPosition({ x: finalX, y: finalY })
    setRotation(direction === 'up' ? 0 : finalX * 0.1)

    setTimeout(() => {
      onSwipe(direction)
      setPosition({ x: 0, y: 0 })
      setRotation(0)
      setCurrentPhotoIndex(0)
    }, 300)
  }

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    handleDragStart(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    handleDragMove(touch.clientX, touch.clientY)
  }

  const handleTouchEnd = () => {
    handleDragEnd()
  }

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX, e.clientY)
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientX, e.clientY)
    }

    const handleMouseUp = () => {
      handleDragEnd()
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  const nextPhoto = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1)
    }
  }

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1)
    }
  }

  const handleCardTap = (e: React.MouseEvent) => {
    if (isDragging) return
    
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return

    const clickX = e.clientX - rect.left
    const cardWidth = rect.width

    if (clickX < cardWidth / 2) {
      prevPhoto()
    } else {
      nextPhoto()
    }
  }

  const opacity = Math.max(0, 1 - Math.abs(position.x) / 200)
  const likeOpacity = Math.max(0, Math.min(1, position.x / 100))
  const nopeOpacity = Math.max(0, Math.min(1, -position.x / 100))
  const superLikeOpacity = Math.max(0, Math.min(1, -position.y / 100))

  return (
    <div
      ref={cardRef}
      className="absolute inset-4 cursor-grab active:cursor-grabbing select-none"
      style={{
        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        opacity,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleCardTap}
    >
      <div className="relative h-full w-full rounded-3xl overflow-hidden shadow-2xl bg-white">
        {/* Photo */}
        <div className="relative h-full w-full">
          <img
            src={photos[currentPhotoIndex]?.url || '/placeholder-profile.jpg'}
            alt={user.displayName}
            className="absolute inset-0 w-full h-full object-cover"
            draggable="false"
          />

          {/* Photo Indicators */}
          <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
            {photos.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-1 rounded-full transition-all ${
                  index === currentPhotoIndex ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>

          {/* Swipe Indicators */}
          <div
            className="absolute top-20 right-10 px-6 py-3 border-4 border-green-500 rounded-2xl rotate-12 text-3xl font-black text-green-500 pointer-events-none"
            style={{ opacity: likeOpacity }}
          >
            LIKE
          </div>
          <div
            className="absolute top-20 left-10 px-6 py-3 border-4 border-red-500 rounded-2xl -rotate-12 text-3xl font-black text-red-500 pointer-events-none"
            style={{ opacity: nopeOpacity }}
          >
            NOPE
          </div>
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 px-6 py-3 bg-blue-500 rounded-2xl text-3xl font-black text-white pointer-events-none"
            style={{ opacity: superLikeOpacity }}
          >
            ⭐ SUPER LIKE
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
        </div>

        {/* Info Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-end justify-between mb-3">
            <div>
              <h2 className="text-3xl font-bold mb-1">
                {user.displayName}, {age}
              </h2>
              {user.jobTitle && (
                <p className="text-lg flex items-center gap-2">
                  <span>💼</span>
                  {user.jobTitle}
                  {user.company && ` at ${user.company}`}
                </p>
              )}
              {user.location && (
                <p className="text-md flex items-center gap-2 mt-1">
                  <span>📍</span>
                  {user.location}
                </p>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCardClick?.()
              }}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl hover:bg-white/30 active:scale-90 transition-all"
            >
              ℹ️
            </button>
          </div>

          {user.bio && (
            <p className="text-base mb-3 line-clamp-2">{user.bio}</p>
          )}

          {user.interests && user.interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {user.interests.slice(0, 5).map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm"
                >
                  {interest.interest.icon} {interest.interest.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
