'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [expiresIn, setExpiresIn] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Send initial verification code
    sendVerificationCode();

    // Start countdown timer
    const interval = setInterval(() => {
      setExpiresIn((prev) => {
        if (prev <= 0) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const sendVerificationCode = async () => {
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/verify-email/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Verification code sent to your email!');
        setExpiresIn(data.expiresIn || 600);
        setCanResend(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Send verification error:', error);
      toast.error('Failed to send verification code');
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || code.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/verify-email/send', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        toast.success('Email verified successfully!');
        // Redirect to onboarding or home
        router.push('/swipe');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Verify error:', error);
      toast.error('Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-500 to-purple-600 flex items-center justify-center text-4xl">
              📧
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Verify Your Email
            </h1>
            <p className="text-gray-600">
              We've sent a 6-digit code to your email address. Enter it below to verify your account.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setCode(value);
                }}
                maxLength={6}
                placeholder="000000"
                className="w-full px-4 py-4 text-center text-2xl font-mono tracking-widest border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                disabled={loading}
                autoComplete="off"
              />
              <p className="mt-2 text-sm text-gray-500 text-center">
                {expiresIn > 0 ? (
                  <>Code expires in {formatTime(expiresIn)}</>
                ) : (
                  <span className="text-red-500">Code expired</span>
                )}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full px-6 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </span>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>

          {/* Resend */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={sendVerificationCode}
              disabled={sending || !canResend}
              className="text-pink-600 font-medium hover:text-pink-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : canResend ? 'Resend Code' : `Resend in ${formatTime(expiresIn)}`}
            </button>
          </div>

          {/* Help */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Tip:</strong> Check your spam folder if you don't see the email. The code is valid for 10 minutes and you have 3 attempts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
