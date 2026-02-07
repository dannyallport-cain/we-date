'use client';

import { useState, useEffect } from 'react';
import PhotoUploader from '@/components/PhotoUploader';
import toast from 'react-hot-toast';

interface StepPhotosProps {
  onNext: () => void;
  onBack: () => void;
}

export default function StepPhotos({ onNext, onBack }: StepPhotosProps) {
  const [photoCount, setPhotoCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPhotoCount();
  }, []);

  const fetchPhotoCount = async () => {
    try {
      const response = await fetch('/api/profile/photos', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setPhotoCount(data.photos?.length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (photoCount < 2) {
      toast.error('Please upload at least 2 photos');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Add your best photos 📸
        </h1>
        <p className="text-gray-600">
          Upload 2-9 photos that show your personality
        </p>
      </div>

      {/* Photo Count Indicator */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Photos uploaded</p>
            <p className="text-2xl font-bold text-gray-900">
              {photoCount} / 9
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${
            photoCount >= 2
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {photoCount >= 2 ? '✓ Ready' : `${2 - photoCount} more needed`}
          </div>
        </div>
      </div>

      {/* Photo Uploader */}
      <PhotoUploader onPhotoCountChange={setPhotoCount} />

      {/* Tips */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-2">
        <h3 className="font-semibold text-purple-900">Photo tips:</h3>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>✨ Use photos that clearly show your face</li>
          <li>📷 Include variety - selfies, full body, hobbies</li>
          <li>😊 Smile! Genuine expressions work best</li>
          <li>🚫 Avoid group photos as your primary photo</li>
        </ul>
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
          disabled={photoCount < 2}
          className={`flex-1 py-4 font-semibold rounded-xl transition-all ${
            photoCount >= 2
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
