'use client';

import { useState, useEffect } from 'react';
import LocationPicker from '@/components/LocationPicker';
import toast from 'react-hot-toast';

interface StepLocationProps {
  onNext: () => void;
  onBack: () => void;
}

export default function StepLocation({ onNext, onBack }: StepLocationProps) {
  const [hasLocation, setHasLocation] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkLocation();
  }, []);

  const checkLocation = async () => {
    try {
      const response = await fetch('/api/location', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setHasLocation(!!data.latitude && !!data.longitude);
      }
    } catch (error) {
      console.error('Failed to check location:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleNext = () => {
    if (!hasLocation) {
      toast.error('Please set your location first');
      return;
    }
    onNext();
  };

  const handleLocationSet = () => {
    setHasLocation(true);
    toast.success('Location saved!');
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Where are you? 📍
        </h1>
        <p className="text-gray-600">
          We'll show you people nearby
        </p>
      </div>

      {/* Location Status */}
      {!isChecking && (
        <div className={`rounded-xl p-4 border ${
          hasLocation
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <p className={`text-sm font-medium ${
            hasLocation ? 'text-green-800' : 'text-yellow-800'
          }`}>
            {hasLocation
              ? '✓ Location set successfully'
              : '⚠️ Location not set yet'}
          </p>
        </div>
      )}

      {/* Location Picker */}
      <LocationPicker onLocationSet={handleLocationSet} />

      {/* Privacy Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-2">🔒 Privacy</h3>
        <p className="text-sm text-blue-800">
          Your exact location is never shared. Others will only see approximate distance (e.g., "5 miles away").
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
          disabled={!hasLocation}
          className={`flex-1 py-4 font-semibold rounded-xl transition-all ${
            hasLocation
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
