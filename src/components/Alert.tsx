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
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
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
