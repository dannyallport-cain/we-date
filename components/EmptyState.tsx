import React from 'react';
import { IconType } from 'react-icons';

interface EmptyStateProps {
  icon: IconType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
      <div className="bg-gray-50 p-6 rounded-full mb-6">
        <Icon className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-500 mb-8 max-w-sm">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-md"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
