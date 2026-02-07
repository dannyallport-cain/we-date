'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface StepReviewProps {
  data: any;
  onBack: () => void;
  onComplete: () => Promise<void>;
  isSubmitting: boolean;
}

export default function StepReview({
  data,
  onBack,
  onComplete,
  isSubmitting,
}: StepReviewProps) {
  const [profile, setProfile] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [profileRes, photosRes] = await Promise.all([
        fetch('/api/profile', { credentials: 'include' }),
        fetch('/api/profile/photos', { credentials: 'include' }),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }

      if (photosRes.ok) {
        const photosData = await photosRes.json();
        setPhotos(photosData.photos || []);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Looking good! 🎉
        </h1>
        <p className="text-gray-600">
          Review your profile before going live
        </p>
      </div>

      {/* Profile Preview Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        {/* Photos */}
        {photos.length > 0 && (
          <div className="relative h-96">
            <Image
              src={photos.find((p) => p.isPrimary)?.url || photos[0].url}
              alt="Profile photo"
              fill
              className="object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              <h2 className="text-2xl font-bold text-white">
                {profile?.displayName}, {profile?.dateOfBirth && calculateAge(profile.dateOfBirth)}
              </h2>
            </div>
          </div>
        )}

        {/* Profile Details */}
        <div className="p-6 space-y-4">
          {/* Bio */}
          {profile?.bio && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                About Me
              </h3>
              <p className="text-gray-900">{profile.bio}</p>
            </div>
          )}

          {/* Interests */}
          {profile?.interests && profile.interests.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest: any) => (
                  <span
                    key={interest.id}
                    className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm"
                  >
                    {interest.emoji} {interest.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Prompts */}
          {profile?.prompts && profile.prompts.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                Get to Know Me
              </h3>
              <div className="space-y-3">
                {profile.prompts.map((prompt: any, index: number) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {prompt.prompt?.text}
                    </p>
                    <p className="text-gray-900">{prompt.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          {profile?.location && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                Location
              </h3>
              <p className="text-gray-900">📍 {profile.location}</p>
            </div>
          )}

          {/* Preferences */}
          {data.preferences && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                Looking For
              </h3>
              <div className="space-y-1 text-gray-900">
                <p>
                  👥 {data.preferences.genderPreference === 'everyone'
                    ? 'Everyone'
                    : data.preferences.genderPreference.charAt(0).toUpperCase() +
                      data.preferences.genderPreference.slice(1)}
                </p>
                <p>
                  🎂 Ages {data.preferences.minAge}-{data.preferences.maxAge}
                </p>
                <p>
                  📍 Within {data.preferences.maxDistance === 500
                    ? 'any distance'
                    : `${data.preferences.maxDistance} miles`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Completion Info */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <h3 className="font-semibold text-green-900 mb-2">✨ Profile Complete!</h3>
        <p className="text-sm text-green-800">
          Your profile looks amazing! When you're ready, tap the button below to start matching.
        </p>
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Profile Checklist</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className={photos.length >= 2 ? 'text-green-500' : 'text-gray-400'}>
              {photos.length >= 2 ? '✓' : '○'}
            </span>
            <span>At least 2 photos</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={profile?.location ? 'text-green-500' : 'text-gray-400'}>
              {profile?.location ? '✓' : '○'}
            </span>
            <span>Location set</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={profile?.interests?.length >= 5 ? 'text-green-500' : 'text-gray-400'}>
              {profile?.interests?.length >= 5 ? '✓' : '○'}
            </span>
            <span>At least 5 interests</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={profile?.prompts?.length >= 3 ? 'text-green-500' : 'text-gray-400'}>
              {profile?.prompts?.length >= 3 ? '✓' : '○'}
            </span>
            <span>At least 3 prompt answers</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={profile?.bio?.length >= 50 ? 'text-green-500' : 'text-gray-400'}>
              {profile?.bio?.length >= 50 ? '✓' : '○'}
            </span>
            <span>Bio written</span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 py-4 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={onComplete}
          disabled={isSubmitting}
          className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              Launching...
            </span>
          ) : (
            'Launch My Profile 🚀'
          )}
        </button>
      </div>
    </div>
  );
}
