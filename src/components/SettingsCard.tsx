'use client';

import React from 'react';
import { Card } from './Card';
import { Button } from './Button';

interface SettingsCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onSave?: () => void;
  onCancel?: () => void;
  isSaving?: boolean;
  showActions?: boolean;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  children,
  onSave,
  onCancel,
  isSaving = false,
  showActions = true,
}) => {
  return (
    <Card>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        )}
      </div>

      <div className="mb-6">{children}</div>

      {showActions && (
        <div className="flex gap-3 border-t pt-6">
          {onCancel && (
            <Button variant="secondary" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
          )}
          {onSave && (
            <Button
              variant="primary"
              onClick={onSave}
              isLoading={isSaving}
            >
              Save Changes
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

SettingsCard.displayName = 'SettingsCard';
