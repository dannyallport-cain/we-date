'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Prompt {
  id: string;
  text: string;
  category: string;
}

interface PromptAnswer {
  promptId: string;
  answer: string;
}

interface StepPromptsProps {
  promptAnswers: PromptAnswer[];
  updateData: (updates: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepPrompts({
  promptAnswers,
  updateData,
  onNext,
  onBack,
}: StepPromptsProps) {
  const [availablePrompts, setAvailablePrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await fetch('/api/prompts');
      if (response.ok) {
        const data = await response.json();
        setAvailablePrompts(data.prompts || []);
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
      toast.error('Failed to load prompts');
    } finally {
      setIsLoading(false);
    }
  };

  const addPrompt = () => {
    if (promptAnswers.length >= 5) {
      toast.error('Maximum 5 prompts allowed');
      return;
    }
    updateData({
      promptAnswers: [
        ...promptAnswers,
        { promptId: '', answer: '' },
      ],
    });
  };

  const removePrompt = (index: number) => {
    updateData({
      promptAnswers: promptAnswers.filter((_, i) => i !== index),
    });
  };

  const updatePrompt = (index: number, field: 'promptId' | 'answer', value: string) => {
    const updated = [...promptAnswers];
    updated[index] = { ...updated[index], [field]: value };
    updateData({ promptAnswers: updated });
  };

  const getUsedPromptIds = () => {
    return promptAnswers.map((pa) => pa.promptId).filter(Boolean);
  };

  const handleNext = async () => {
    const validAnswers = promptAnswers.filter(
      (pa) => pa.promptId && pa.answer.trim().length >= 10
    );

    if (validAnswers.length < 3) {
      toast.error('Please answer at least 3 prompts (min 10 characters each)');
      return;
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ prompts: validAnswers }),
      });

      if (!response.ok) {
        throw new Error('Failed to save prompts');
      }

      toast.success('Prompts saved!');
      onNext();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save. Please try again.');
    }
  };

  const validAnswersCount = promptAnswers.filter(
    (pa) => pa.promptId && pa.answer.trim().length >= 10
  ).length;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Show your personality 💬
        </h1>
        <p className="text-gray-600">
          Answer at least 3 prompts (min 10 characters each)
        </p>
      </div>

      {/* Prompt Counter */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Valid answers</p>
            <p className="text-2xl font-bold text-gray-900">
              {validAnswersCount} / 5
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${
            validAnswersCount >= 3
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {validAnswersCount >= 3
              ? '✓ Ready'
              : `${3 - validAnswersCount} more needed`}
          </div>
        </div>
      </div>

      {/* Prompts */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {promptAnswers.map((promptAnswer, index) => (
            <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-3">
                  {/* Prompt Selection */}
                  <select
                    value={promptAnswer.promptId}
                    onChange={(e) => updatePrompt(index, 'promptId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">Select a prompt...</option>
                    {availablePrompts
                      .filter(
                        (p) =>
                          p.id === promptAnswer.promptId ||
                          !getUsedPromptIds().includes(p.id)
                      )
                      .map((prompt) => (
                        <option key={prompt.id} value={prompt.id}>
                          {prompt.text}
                        </option>
                      ))}
                  </select>

                  {/* Answer Input */}
                  <textarea
                    value={promptAnswer.answer}
                    onChange={(e) => updatePrompt(index, 'answer', e.target.value)}
                    placeholder="Your answer..."
                    maxLength={150}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                    rows={3}
                  />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{promptAnswer.answer.length}/150</span>
                    {promptAnswer.answer.length < 10 && promptAnswer.answer.length > 0 && (
                      <span className="text-red-500">Min 10 characters</span>
                    )}
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removePrompt(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {/* Add Prompt Button */}
          {promptAnswers.length < 5 && (
            <button
              onClick={addPrompt}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-pink-500 hover:text-pink-500 transition-all"
            >
              + Add another prompt
            </button>
          )}
        </div>
      )}

      {/* Tip */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <p className="text-sm text-purple-800">
          💡 <strong>Tip:</strong> Be authentic and creative! Good answers spark conversations.
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
          disabled={validAnswersCount < 3}
          className={`flex-1 py-4 font-semibold rounded-xl transition-all ${
            validAnswersCount >= 3
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
