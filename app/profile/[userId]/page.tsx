'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import PhotoCarousel from '@/components/PhotoCarousel';
import ReportModal from '@/components/ReportModal';
import BlockModal from '@/components/BlockModal';

interface UserProfile {
  id: string;
  displayName: string;
  age: number;
  gender: string;
  bio?: string;
  jobTitle?: string;
  company?: string;
  school?: string;
  height?: number;
  location?: string;
  distance?: number;
  isVerified: boolean;
  lastActive: string;
  photos: Array<{
    id: string;
    url: string;
    order: number;
    isPrimary: boolean;
  }>;
  interests: Array<{
    id: string;
    name: string;
    icon?: string;
  }>;
  prompts: Array<{
    id: string;
    promptId?: string;
    promptText: string;
    answer: string;
  }>;
  alreadySwiped?: string | null;
  isMatched: boolean;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`/api/users/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data.user);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile');
      router.push('/swipe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = async (type: 'like' | 'pass') => {
    if (!profile) return;

    setIsActionLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        toast.error('Please login to continue');
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/swipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetUserId: profile.id,
          action: type.toUpperCase(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to swipe');
      }

      const data = await response.json();

      if (data.matched) {
        toast.success("It's a match! 💕", { duration: 3000 });
        router.push('/matches');
      } else {
        toast.success(type === 'like' ? 'Liked!' : 'Passed');
        router.push('/swipe');
      }
    } catch (error) {
      console.error('Swipe error:', error);
      toast.error('Failed to process action');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!profile) throw new Error('No profile loaded');

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      throw new Error('Please login to continue');
    }

    const response = await fetch('/api/users/block', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId: profile.id }),
    });

    if (!response.ok) {
      throw new Error('Failed to block user');
    }

    // Navigate away after successful block
    router.push('/swipe');
  };

  const handleReport = async (reason: string) => {
    if (!profile) throw new Error('No profile loaded');

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      throw new Error('Please login to continue');
    }

    const response = await fetch('/api/users/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: profile.id,
        reason,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to report user');
    }
  };

  const formatLastActive = (lastActive: string) => {
    const date = new Date(lastActive);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 5) return 'Active now';
    if (diffMins < 60) return `Active ${diffMins}m ago`;
    if (diffHours < 24) return `Active ${diffHours}h ago`;
    if (diffDays < 7) return `Active ${diffDays}d ago`;
    return 'Active recently';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Profile not found</p>
          <button
            onClick={() => router.push('/swipe')}
            className="px-6 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600"
          >
            Back to Swipe
          </button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/swipe')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReportModal(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Report"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </button>
            <button
              onClick={() => setShowBlockModal(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Block"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 max-w-2xl mx-auto">
        {/* Photo Carousel */}
        <PhotoCarousel photos={profile.photos} />

        {/* Profile Info */}
        <div className="px-4 py-6 space-y-6">
          {/* Basic Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.displayName}, {profile.age}
              </h1>
              {profile.isVerified && (
                <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              {profile.location && (
                <span className="flex items-center gap-1">
                  📍 {profile.location}
                  {profile.distance && ` • ${Math.round(profile.distance)} mi away`}
                </span>
              )}
            </div>

            <div className="mt-2 text-sm text-gray-500">
              {formatLastActive(profile.lastActive)}
            </div>
          </div>

          {/* Job/School */}
          {(profile.jobTitle || profile.school) && (
            <div className="space-y-2">
              {profile.jobTitle && (
                <div className="flex items-center gap-2 text-gray-700">
                  <span>💼</span>
                  <span>
                    {profile.jobTitle}
                    {profile.company && ` at ${profile.company}`}
                  </span>
                </div>
              )}
              {profile.school && (
                <div className="flex items-center gap-2 text-gray-700">
                  <span>🎓</span>
                  <span>{profile.school}</span>
                </div>
              )}
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">About</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}

          {/* Interests */}
          {profile.interests.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest.id}
                    className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm"
                  >
                    {interest.icon} {interest.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Prompts */}
          {profile.prompts.length > 0 && (
            <div className="space-y-3">
              {profile.prompts.map((prompt) => (
                <div key={prompt.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">{prompt.promptText}</p>
                  <p className="text-gray-900">{prompt.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {!profile.isMatched && !profile.alreadySwiped && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-lg border-t border-gray-200 pb-safe">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-center gap-6">
            <button
              onClick={() => handleSwipe('pass')}
              disabled={isActionLoading}
              className="w-16 h-16 rounded-full bg-gray-100 border-2 border-gray-300 hover:bg-gray-200 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center hover:shadow-xl active:scale-90"
              title="Pass"
            >
              <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <button
              onClick={() => handleSwipe('like')}
              disabled={isActionLoading}
              className="w-20 h-20 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center hover:shadow-xl active:scale-90"
              title="Like"
            >
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {profile.isMatched && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-lg border-t border-gray-200 pb-safe">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <button
              onClick={() => router.push(`/messages/${profile.id}`)}
              className="w-full py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-accent-600 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              Send Message 💬
            </button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        userId={profile.id}
        userName={profile.displayName}
        onReport={handleReport}
      />

      {/* Block Modal */}
      <BlockModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        userId={profile.id}
        userName={profile.displayName}
        onBlock={handleBlock}
      />
    </div>
  );
}
