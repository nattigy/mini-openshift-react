'use client';

import React from 'react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  message,
  onClose,
  className,
  ...props
}) => {
  const variants = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconVariants = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div
      className={`p-4 rounded-lg border ${variants[variant]} ${className || ''}`}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <span className="text-lg font-bold mr-3">{iconVariants[variant]}</span>
          <div>
            {title && <h4 className="font-semibold">{title}</h4>}
            <p className={`text-sm ${title ? 'mt-1' : ''}`}>{message}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-lg hover:opacity-70 transition-opacity"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

Alert.displayName = 'Alert';
