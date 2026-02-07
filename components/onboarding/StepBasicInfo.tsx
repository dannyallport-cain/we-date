'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface StepBasicInfoProps {
  data: {
    displayName: string;
    dateOfBirth: string;
    gender: string;
  };
  updateData: (updates: any) => void;
  onNext: () => void;
}

export default function StepBasicInfo({ data, updateData, onNext }: StepBasicInfoProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!data.displayName.trim()) {
      newErrors.displayName = 'Name is required';
    } else if (data.displayName.trim().length < 2) {
      newErrors.displayName = 'Name must be at least 2 characters';
    } else if (data.displayName.trim().length > 50) {
      newErrors.displayName = 'Name must be less than 50 characters';
    }

    if (!data.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const age = calculateAge(data.dateOfBirth);
      if (age < 18) {
        newErrors.dateOfBirth = 'You must be at least 18 years old';
      } else if (age > 100) {
        newErrors.dateOfBirth = 'Please enter a valid date';
      }
    }

    if (!data.gender) {
      newErrors.gender = 'Please select your gender';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) {
      toast.error('Please fix the errors below');
      return;
    }

    try {
      // Save basic info to database
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          displayName: data.displayName.trim(),
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      toast.success('Profile info saved!');
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
          Let's get started! 👋
        </h1>
        <p className="text-gray-600">
          Tell us a bit about yourself
        </p>
      </div>

      {/* Name */}
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
          What's your name?
        </label>
        <input
          id="displayName"
          type="text"
          value={data.displayName}
          onChange={(e) => updateData({ displayName: e.target.value })}
          className={`w-full px-4 py-3 border ${
            errors.displayName ? 'border-red-500' : 'border-gray-300'
          } rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500`}
          placeholder="Enter your first name"
          maxLength={50}
        />
        {errors.displayName && (
          <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
        )}
      </div>

      {/* Date of Birth */}
      <div>
        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
          When's your birthday?
        </label>
        <input
          id="dateOfBirth"
          type="date"
          value={data.dateOfBirth}
          onChange={(e) => updateData({ dateOfBirth: e.target.value })}
          className={`w-full px-4 py-3 border ${
            errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
          } rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500`}
          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
        />
        {errors.dateOfBirth && (
          <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
        )}
        {data.dateOfBirth && !errors.dateOfBirth && (
          <p className="mt-1 text-sm text-gray-500">
            Age: {calculateAge(data.dateOfBirth)} years old
          </p>
        )}
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          What's your gender?
        </label>
        <div className="grid grid-cols-3 gap-3">
          {['Man', 'Woman', 'Non-binary'].map((gender) => (
            <button
              key={gender}
              onClick={() => updateData({ gender: gender.toLowerCase() })}
              className={`py-3 px-4 rounded-xl border-2 transition-all ${
                data.gender === gender.toLowerCase()
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {gender}
            </button>
          ))}
        </div>
        {errors.gender && (
          <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
        )}
      </div>

      {/* Privacy Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          🔒 Your information is private and secure. Only your name and age will be visible to others.
        </p>
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg"
      >
        Continue
      </button>
    </div>
  );
}
