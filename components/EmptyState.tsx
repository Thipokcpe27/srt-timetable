'use client';

import { SearchX, Search, AlertTriangle } from 'lucide-react';

type EmptyStateType = 'no-results' | 'no-search' | 'error';

interface EmptyStateProps {
  type: EmptyStateType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ type, title, description, actionLabel, onAction }: EmptyStateProps) {
  const getIllustration = () => {
    switch (type) {
      case 'no-results':
        return (
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute inset-4 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <SearchX className="w-16 h-16 text-blue-400" strokeWidth={1.5} />
            </div>
          </div>
        );
      case 'no-search':
        return (
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="100" cy="100" r="80" fill="url(#grad1)" opacity="0.1" />
              <circle cx="100" cy="100" r="60" fill="url(#grad2)" opacity="0.15" />
              <circle cx="100" cy="100" r="40" fill="url(#grad3)" opacity="0.2" />
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
                </linearGradient>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                </linearGradient>
                <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#93c5fd', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-16 h-16 text-blue-500" strokeWidth={1.5} />
            </div>
          </div>
        );
      case 'error':
        return (
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-red-200 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute inset-4 bg-gradient-to-br from-red-200 to-red-300 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <AlertTriangle className="w-16 h-16 text-red-400" strokeWidth={1.5} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="backdrop-blur-md bg-white/80 rounded-xl border border-white/40 p-12 text-center shadow-card">
      {getIllustration()}
      
      <h3 className="text-xl font-bold text-gray-900 mb-3">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
