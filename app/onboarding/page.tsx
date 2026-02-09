'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// Step Components
import StepBasicInfo from '@/components/onboarding/StepBasicInfo';
import StepPhotos from '@/components/onboarding/StepPhotos';
import StepLocation from '@/components/onboarding/StepLocation';
import StepInterests from '@/components/onboarding/StepInterests';
import StepPrompts from '@/components/onboarding/StepPrompts';
import StepBio from '@/components/onboarding/StepBio';
import StepPreferences from '@/components/onboarding/StepPreferences';
import StepReview from '@/components/onboarding/StepReview';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Onboarding data state
  const [onboardingData, setOnboardingData] = useState({
    // Step 1: Basic Info
    displayName: '',
    dateOfBirth: '',
    gender: '',
    
    // Step 2: Photos (handled by PhotoUploader component)
    
    // Step 3: Location (handled by LocationPicker component)
    
    // Step 4: Interests
    selectedInterests: [] as string[],
    
    // Step 5: Prompts
    promptAnswers: [] as { promptId: string; answer: string }[],
    
    // Step 6: Bio
    bio: '',
    
    // Step 7: Preferences
    preferences: {
      minAge: 18,
      maxAge: 100,
      maxDistance: 50,
      genderPreference: 'everyone',
    },
  });

  const totalSteps = 8;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const stepTitles = [
    'Tell us about yourself',
    'Add your photos',
    'Where are you?',
    'What are your interests?',
    'Answer some prompts',
    'Write your bio',
    'Set your preferences',
    'Review your profile',
  ];

  // Update onboarding data
  const updateData = (updates: Partial<typeof onboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...updates }));
  };

  // Navigate to next step
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  // Navigate to previous step
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  // Complete onboarding
  const completeOnboarding = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(onboardingData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to complete onboarding');
      }

      toast.success('Profile complete! Welcome to WeDate 💕');
      router.push('/swipe');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error(error.message || 'Failed to complete profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepBasicInfo
            data={onboardingData}
            updateData={updateData}
            onNext={goToNextStep}
          />
        );
      case 2:
        return (
          <StepPhotos
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 3:
        return (
          <StepLocation
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 4:
        return (
          <StepInterests
            selectedInterests={onboardingData.selectedInterests}
            updateData={updateData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 5:
        return (
          <StepPrompts
            promptAnswers={onboardingData.promptAnswers}
            updateData={updateData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 6:
        return (
          <StepBio
            bio={onboardingData.bio}
            updateData={updateData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 7:
        return (
          <StepPreferences
            preferences={onboardingData.preferences}
            updateData={updateData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 8:
        return (
          <StepReview
            data={onboardingData}
            onBack={goToPreviousStep}
            onComplete={completeOnboarding}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 pb-20">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg">
        <div className="relative h-1 bg-gray-300">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500">
              Step {currentStep} of {totalSteps}
            </div>
            <div className="text-sm font-semibold text-gray-900">
              {stepTitles[currentStep - 1]}
            </div>
          </div>
          
          {currentStep > 1 && (
            <button
              onClick={goToPreviousStep}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Back
            </button>
          )}
        </div>
      </div>

      {/* Step Content */}
      <div className="pt-24 px-4 max-w-2xl mx-auto">
        {renderStep()}
      </div>
    </div>
  );
}
