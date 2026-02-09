'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface UserSettings {
  // Discovery preferences
  minAge: number;
  maxAge: number;
  maxDistance: number;
  showMe: string;

  // Privacy settings
  showDistance: boolean;
  showAge: boolean;
  incognitoMode: boolean;

  // Notification settings
  notifications: {
    newMatches: boolean;
    newMessages: boolean;
    newLikes: boolean;
    superLikes: boolean;
    profileViews: boolean;
    promotions: boolean;
  };

  // Account info
  displayName: string;
  email: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;

  // Premium info
  isPremium: boolean;
  premiumUntil: string | null;
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<Array<{ id: string; displayName: string; blockedAt: string }>>([]);
  const [isLoadingBlocked, setIsLoadingBlocked] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchBlockedUsers();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      const user = data.profile;
      
      if (!user) {
        throw new Error('No user data returned');
      }

      setSettings({
        minAge: user.ageMin || 18,
        maxAge: user.ageMax || 100,
        maxDistance: user.maxDistance || 50,
        showMe: user.showMe || 'EVERYONE',
        showDistance: user.showDistance !== false,
        showAge: user.showAge !== false,
        incognitoMode: user.incognitoMode || false,
        notifications: {
          newMatches: true, // Default to true, would be stored in user preferences
          newMessages: true,
          newLikes: true,
          superLikes: true,
          profileViews: true,
          promotions: true,
        },
        displayName: user.displayName,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        isPremium: user.isPremium || false,
        premiumUntil: user.premiumUntil,
      });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBlockedUsers = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return;

      const response = await fetch('/api/users/blocked', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setBlockedUsers(data.blockedUsers || []);
      }
    } catch (error) {
      console.error('Failed to fetch blocked users:', error);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ageMin: settings.minAge,
          ageMax: settings.maxAge,
          maxDistance: settings.maxDistance,
          showMe: settings.showMe,
          showDistance: settings.showDistance,
          showAge: settings.showAge,
          incognitoMode: settings.incognitoMode,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    router.push('/auth/login');
  };

  const handleUnblock = async (userId: string) => {
    if (!confirm('Are you sure you want to unblock this user? They will be able to see your profile and match with you again.')) return;

    setIsLoadingBlocked(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        toast.error('Please login to continue');
        return;
      }

      const response = await fetch('/api/users/unblock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to unblock user');
      }

      toast.success('User unblocked');
      fetchBlockedUsers(); // Refresh the list
    } catch (error) {
      console.error('Unblock error:', error);
      toast.error('Failed to unblock user');
    } finally {
      setIsLoadingBlocked(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/profile', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      localStorage.removeItem('token');
      toast.success('Account deleted successfully');
      router.push('/');
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('Failed to delete account');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 to-purple-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
          <p className="text-gray-600">Failed to load settings. Please try again.</p>
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
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-purple-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Discovery Preferences */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Discovery Preferences</h2>

          {/* Age Range */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age Range: {settings.minAge} - {settings.maxAge} years old
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="18"
                max="100"
                value={settings.minAge}
                onChange={(e) => setSettings({ ...settings, minAge: parseInt(e.target.value) })}
                className="flex-1"
              />
              <input
                type="range"
                min="18"
                max="100"
                value={settings.maxAge}
                onChange={(e) => setSettings({ ...settings, maxAge: parseInt(e.target.value) })}
                className="flex-1"
              />
            </div>
          </div>

          {/* Distance */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Distance: {settings.maxDistance === 500 ? 'Anywhere' : `${settings.maxDistance} miles`}
            </label>
            <input
              type="range"
              min="5"
              max="500"
              step="5"
              value={settings.maxDistance}
              onChange={(e) => setSettings({ ...settings, maxDistance: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Show Me */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Show Me</label>
            <div className="flex space-x-3">
              {[
                { value: 'WOMAN', label: 'Women' },
                { value: 'MAN', label: 'Men' },
                { value: 'EVERYONE', label: 'Everyone' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSettings({ ...settings, showMe: option.value })}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    settings.showMe === option.value
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Show Distance</h3>
                <p className="text-sm text-gray-500">Let others see how far away you are</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showDistance}
                  onChange={(e) => setSettings({ ...settings, showDistance: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Show Age</h3>
                <p className="text-sm text-gray-500">Display your age on your profile</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showAge}
                  onChange={(e) => setSettings({ ...settings, showAge: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Incognito Mode</h3>
                <p className="text-sm text-gray-500">Hide your profile from discovery</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.incognitoMode}
                  onChange={(e) => setSettings({ ...settings, incognitoMode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>

          <div className="space-y-4">
            {[
              { key: 'newMatches', label: 'New Matches', desc: 'When someone likes you back' },
              { key: 'newMessages', label: 'New Messages', desc: 'When you receive a message' },
              { key: 'newLikes', label: 'New Likes', desc: 'When someone likes your profile' },
              { key: 'superLikes', label: 'Super Likes', desc: 'When someone super likes you' },
              { key: 'profileViews', label: 'Profile Views', desc: 'When someone views your profile' },
              { key: 'promotions', label: 'Promotions', desc: 'Special offers and updates' },
            ].map((notif) => (
              <div key={notif.key} className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{notif.label}</h3>
                  <p className="text-sm text-gray-500">{notif.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications[notif.key as keyof typeof settings.notifications]}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        [notif.key]: e.target.checked
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <p className="text-gray-900">{settings.displayName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="flex items-center">
                <p className="text-gray-900">{settings.email}</p>
                {settings.isEmailVerified && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <div className="flex items-center">
                <p className="text-gray-900">Not connected</p>
                {settings.isPhoneVerified && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Premium Subscription */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Premium Subscription</h2>
            {settings.isPremium && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                ⭐ Premium Active
              </span>
            )}
          </div>

          {settings.isPremium ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <span className="text-sm font-medium">Active</span>
              </div>
              {settings.premiumUntil && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Expires</span>
                  <span className="text-sm font-medium">
                    {new Date(settings.premiumUntil).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-white/20">
                <p className="text-sm text-white/80 mb-3">
                  Enjoy unlimited likes, boosts, and premium features!
                </p>
                <button
                  onClick={() => router.push('/premium')}
                  className="w-full bg-white text-pink-600 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Manage Subscription
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-white/90">
                Unlock unlimited likes, boosts, and premium features to find your perfect match faster!
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center">
                  <span className="text-yellow-300 mr-2">⭐</span>
                  Unlimited Likes
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-300 mr-2">🚀</span>
                  Boost Profile
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-300 mr-2">👀</span>
                  See Who Liked You
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-300 mr-2">↩️</span>
                  Rewind Swipes
                </div>
              </div>
              <button
                onClick={() => router.push('/premium')}
                className="w-full bg-white text-pink-600 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Upgrade to Premium
              </button>
            </div>
          )}
        </div>

        {/* Blocked Users */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Blocked Users</h2>

          {blockedUsers.length === 0 ? (
            <p className="text-gray-600 text-sm">No blocked users</p>
          ) : (
            <div className="space-y-3">
              {blockedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{user.displayName}</p>
                    <p className="text-sm text-gray-500">
                      Blocked {new Date(user.blockedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnblock(user.id)}
                    disabled={isLoadingBlocked}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="w-full bg-pink-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>

          <div className="flex space-x-4">
            <button
              onClick={handleLogout}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Logout
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex-1 bg-red-100 text-red-700 py-3 px-4 rounded-xl font-semibold hover:bg-red-200 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Account</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}