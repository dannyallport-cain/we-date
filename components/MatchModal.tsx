'use client';

import React, { useEffect } from 'react';
import { IoHeart, IoChatbubble } from 'react-icons/io5';
import Link from 'next/link';

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchedUser: {
    id: string;
    displayName: string;
    photo: string;
  };
  currentUserPhoto: string;
}

export default function MatchModal({ isOpen, onClose, matchedUser, currentUserPhoto }: MatchModalProps) {
  if (!isOpen) return null;

  // Simple confetti effect could be added here later
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-transparent text-center">
        {/* Match Text */}
        <div className="mb-8 animate-bounce-slow">
          <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transform -rotate-6 italic tracking-wider drop-shadow-2xl font-serif">
            It&apos;s a
          </h2>
          <h2 className="text-6xl font-black text-white transform rotate-3 tracking-widest drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] font-sans">
            MATCH!
          </h2>
        </div>

        {/* Avatars */}
        <div className="flex justify-center items-center -space-x-4 mb-8">
          <div className="relative w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden transform -rotate-12 animate-slide-in-left">
            <img src={currentUserPhoto} alt="You" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg animate-scale-in">
            <IoHeart className="text-pink-500 w-8 h-8" />
          </div>
          <div className="relative w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden transform rotate-12 animate-slide-in-right">
            <img src={matchedUser.photo} alt={matchedUser.displayName} className="w-full h-full object-cover" />
          </div>
        </div>

        <p className="text-white text-lg mb-8 font-medium">
          You and {matchedUser.displayName} liked each other!
        </p>

        {/* Actions */}
        <div className="space-y-4">
          <Link href={`/messages/new?userId=${matchedUser.id}`} onClick={onClose}>
            <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-full font-bold text-lg shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2">
              <IoChatbubble className="w-6 h-6" />
              Send a Message
            </button>
          </Link>
          
          <button 
            onClick={onClose}
            className="w-full bg-white/10 text-white py-4 rounded-full font-semibold hover:bg-white/20 transition-colors backdrop-blur-md"
          >
            Keep Swiping
          </button>
        </div>
      </div>
    </div>
  );
}
