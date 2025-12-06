'use client';

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  className,
  ...props
}) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors ${className || ''}`}
      {...props}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          {footer}
        </div>
      )}
    </div>
  );
};

Card.displayName = 'Card';
