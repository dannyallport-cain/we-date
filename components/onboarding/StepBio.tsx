'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface StepBioProps {
  bio: string;
  updateData: (updates: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepBio({ bio, updateData, onNext, onBack }: StepBioProps) {
  const [error, setError] = useState('');

  const handleNext = async () => {
    const trimmedBio = bio.trim();

    if (trimmedBio.length < 50) {
      setError('Bio must be at least 50 characters');
      toast.error('Bio is too short');
      return;
    }

    if (trimmedBio.length > 500) {
      setError('Bio must be less than 500 characters');
      toast.error('Bio is too long');
      return;
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ bio: trimmedBio }),
      });

      if (!response.ok) {
        throw new Error('Failed to save bio');
      }

      toast.success('Bio saved!');
      onNext();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tell your story ✍️
        </h1>
        <p className="text-gray-600">
          Write a bio that shows who you are (50-500 characters)
        </p>
      </div>

      {/* Character Counter */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Characters</p>
            <p className="text-2xl font-bold text-gray-900">
              {bio.length} / 500
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${
            bio.length >= 50
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {bio.length >= 50
              ? '✓ Ready'
              : `${50 - bio.length} more needed`}
          </div>
        </div>
      </div>

      {/* Bio Textarea */}
      <div>
        <textarea
          value={bio}
          onChange={(e) => {
            updateData({ bio: e.target.value });
            setError('');
          }}
          placeholder="Tell people about yourself... What do you love? What are you looking for? What makes you unique?"
          maxLength={500}
          className={`w-full px-4 py-3 border ${
            error ? 'border-red-500' : 'border-gray-300'
          } rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none`}
          rows={8}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      {/* Bio Tips */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-2">
        <h3 className="font-semibold text-purple-900">Writing tips:</h3>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>✨ Share what makes you unique</li>
          <li>😊 Use a friendly, conversational tone</li>
          <li>🎯 Mention hobbies or passions</li>
          <li>💫 Keep it positive and authentic</li>
          <li>🚫 Avoid clichés like "love to laugh"</li>
        </ul>
      </div>

      {/* Example Bios */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Examples:</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            "Weekend warrior who loves hiking trails and discovering new coffee shops. Currently learning Spanish and always down for spontaneous road trips. Dog lover and terrible cook looking for someone to laugh at my kitchen disasters with. 🐶☕️"
          </p>
          <p className="pt-2 border-t border-blue-200">
            "NYC transplant who still gets excited about the subway. Music festival enthusiast and aspiring plant parent (RIP to my succulents). Looking for someone who can handle my terrible puns and loves trying new restaurants as much as I do. 🌮🎵"
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-4 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={bio.trim().length < 50}
          className={`flex-1 py-4 font-semibold rounded-xl transition-all ${
            bio.trim().length >= 50
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
