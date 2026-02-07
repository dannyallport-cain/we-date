'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Interest {
  id: string;
  name: string;
  emoji: string;
}

interface StepInterestsProps {
  selectedInterests: string[];
  updateData: (updates: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepInterests({
  selectedInterests,
  updateData,
  onNext,
  onBack,
}: StepInterestsProps) {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    try {
      const response = await fetch('/api/interests');
      if (response.ok) {
        const data = await response.json();
        setInterests(data.interests || []);
      }
    } catch (error) {
      console.error('Failed to fetch interests:', error);
      toast.error('Failed to load interests');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleInterest = (interestId: string) => {
    if (selectedInterests.includes(interestId)) {
      updateData({
        selectedInterests: selectedInterests.filter((id) => id !== interestId),
      });
    } else {
      if (selectedInterests.length >= 15) {
        toast.error('Maximum 15 interests allowed');
        return;
      }
      updateData({
        selectedInterests: [...selectedInterests, interestId],
      });
    }
  };

  const handleNext = async () => {
    if (selectedInterests.length < 5) {
      toast.error('Please select at least 5 interests');
      return;
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ interestIds: selectedInterests }),
      });

      if (!response.ok) {
        throw new Error('Failed to save interests');
      }

      toast.success('Interests saved!');
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
          What are you into? 🎯
        </h1>
        <p className="text-gray-600">
          Select at least 5 interests (max 15)
        </p>
      </div>

      {/* Interest Counter */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Interests selected</p>
            <p className="text-2xl font-bold text-gray-900">
              {selectedInterests.length} / 15
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${
            selectedInterests.length >= 5
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {selectedInterests.length >= 5
              ? '✓ Ready'
              : `${5 - selectedInterests.length} more needed`}
          </div>
        </div>
      </div>

      {/* Interests Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {interests.map((interest) => (
            <button
              key={interest.id}
              onClick={() => toggleInterest(interest.id)}
              className={`py-3 px-4 rounded-xl border-2 transition-all text-left ${
                selectedInterests.includes(interest.id)
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-2xl mb-1">{interest.emoji}</div>
              <div className="text-sm font-medium text-gray-900">
                {interest.name}
              </div>
            </button>
          ))}
        </div>
      )}

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
          disabled={selectedInterests.length < 5}
          className={`flex-1 py-4 font-semibold rounded-xl transition-all ${
            selectedInterests.length >= 5
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
