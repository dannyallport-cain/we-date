'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Photo {
  id: string;
  url: string;
  order: number;
  isPrimary: boolean;
}

interface PhotoCarouselProps {
  photos: Photo[];
}

export default function PhotoCarousel({ photos }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!photos || photos.length === 0) {
    return (
      <div className="relative w-full h-96 bg-gray-200 rounded-2xl flex items-center justify-center">
        <span className="text-gray-400">No photos</span>
      </div>
    );
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <>
      {/* Carousel */}
      <div className="relative w-full h-[500px] bg-gray-900 rounded-2xl overflow-hidden group">
        {/* Current Photo */}
        <div className="relative w-full h-full">
          <Image
            src={photos[currentIndex].url}
            alt={`Photo ${currentIndex + 1}`}
            fill
            className="object-cover cursor-pointer"
            onClick={() => setIsFullscreen(true)}
            priority={currentIndex === 0}
          />

          {/* Gradient Overlay at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
            >
              <svg className="w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
            >
              <svg className="w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Pagination Dots */}
        {photos.length > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                className={`h-1 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-white'
                    : 'w-1 bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}

        {/* Photo Counter */}
        <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
          {currentIndex + 1} / {photos.length}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-black">
          {/* Close Button */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Fullscreen Image */}
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={photos[currentIndex].url}
              alt={`Photo ${currentIndex + 1}`}
              fill
              className="object-contain"
              onClick={(e) => {
                // Click on image edges to navigate
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                if (x < rect.width / 3) {
                  goToPrevious();
                } else if (x > (rect.width * 2) / 3) {
                  goToNext();
                }
              }}
            />

            {/* Navigation Arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Pagination Dots */}
            {photos.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'w-8 bg-white'
                        : 'w-2 bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Photo Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 text-white rounded-full">
              {currentIndex + 1} / {photos.length}
            </div>
          </div>

          {/* Swipe Instructions */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            Tap left/right to navigate
          </div>
        </div>
      )}
    </>
  );
}
