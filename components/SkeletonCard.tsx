import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden bg-gray-200 animate-pulse border border-gray-100 shadow-xl">
      {/* Image Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-200 to-gray-300" />
      
      {/* Overlay Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/20 to-transparent pt-20">
        {/* Name and Age */}
        <div className="flex items-end gap-3 mb-2">
          <div className="h-8 w-32 bg-white/40 rounded-lg"></div>
          <div className="h-6 w-12 bg-white/40 rounded-lg mb-1"></div>
        </div>
        
        {/* Location/Distance */}
        <div className="h-4 w-24 bg-white/30 rounded-full mb-4"></div>
        
        {/* Bio lines */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-white/20 rounded-full"></div>
          <div className="h-3 w-2/3 bg-white/20 rounded-full"></div>
        </div>
      </div>

      {/* Action Buttons Placeholder */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-6 px-6">
        <div className="w-14 h-14 rounded-full bg-white/30"></div>
        <div className="w-12 h-12 rounded-full bg-white/30 mt-1"></div>
        <div className="w-14 h-14 rounded-full bg-white/30"></div>
      </div>
    </div>
  );
}
