'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface Preferences {
  minAge: number;
  maxAge: number;
  maxDistance: number;
  genderPreference: string;
}

interface StepPreferencesProps {
  preferences: Preferences;
  updateData: (updates: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepPreferences({
  preferences,
  updateData,
  onNext,
  onBack,
}: StepPreferencesProps) {
  const handleNext = async () => {
    if (preferences.minAge >= preferences.maxAge) {
      toast.error('Minimum age must be less than maximum age');
      return;
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          minAgePreference: preferences.minAge,
          maxAgePreference: preferences.maxAge,
          maxDistance: preferences.maxDistance,
          genderPreference: preferences.genderPreference,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      toast.success('Preferences saved!');
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
          Set your preferences ⚙️
        </h1>
        <p className="text-gray-600">
          Who would you like to meet?
        </p>
      </div>

      {/* Age Range */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-4">
        <h3 className="font-semibold text-gray-900">Age Range</h3>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-600">Minimum Age</label>
            <span className="text-lg font-semibold text-gray-900">
              {preferences.minAge}
            </span>
          </div>
          <input
            type="range"
            min="18"
            max="100"
            value={preferences.minAge}
            onChange={(e) =>
              updateData({
                preferences: { ...preferences, minAge: parseInt(e.target.value) },
              })
            }
            className="w-full h-2 bg-gradient-to-r from-pink-200 to-purple-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-600">Maximum Age</label>
            <span className="text-lg font-semibold text-gray-900">
              {preferences.maxAge}
            </span>
          </div>
          <input
            type="range"
            min="18"
            max="100"
            value={preferences.maxAge}
            onChange={(e) =>
              updateData({
                preferences: { ...preferences, maxAge: parseInt(e.target.value) },
              })
            }
            className="w-full h-2 bg-gradient-to-r from-pink-200 to-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

        <p className="text-sm text-gray-500 text-center pt-2">
          Looking for people aged {preferences.minAge} - {preferences.maxAge}
        </p>
      </div>

      {/* Distance */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-4">
        <h3 className="font-semibold text-gray-900">Maximum Distance</h3>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-600">Distance</label>
            <span className="text-lg font-semibold text-gray-900">
              {preferences.maxDistance === 500 ? 'Anywhere' : `${preferences.maxDistance} miles`}
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="500"
            step="5"
            value={preferences.maxDistance}
            onChange={(e) =>
              updateData({
                preferences: { ...preferences, maxDistance: parseInt(e.target.value) },
              })
            }
            className="w-full h-2 bg-gradient-to-r from-pink-200 to-purple-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span>5 miles</span>
          <span>500+ miles</span>
        </div>
      </div>

      {/* Gender Preference */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-4">
        <h3 className="font-semibold text-gray-900">Interested In</h3>
        
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'women', label: 'Women' },
            { value: 'men', label: 'Men' },
            { value: 'non-binary', label: 'Non-binary' },
            { value: 'everyone', label: 'Everyone' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() =>
                updateData({
                  preferences: { ...preferences, genderPreference: option.value },
                })
              }
              className={`py-3 px-4 rounded-xl border-2 transition-all ${
                preferences.genderPreference === option.value
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          💡 You can change these preferences anytime in Settings
        </p>
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
          className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
