'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Input, Badge, Button, Alert } from '@/components';
import { User } from '@/types/user';

interface UserDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (user: Partial<User>) => Promise<void>;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
}) => {
  const [editData, setEditData] = useState<Partial<User>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEditData(user);
      setIsEditing(false);
      setError(null);
    }
  }, [user, isOpen]);

  const handleSave = async () => {
    if (!onSave || !user) return;

    setIsSaving(true);
    setError(null);

    try {
      await onSave(editData);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user || !isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Details" size="lg">
      <div className="space-y-6">
        {error && (
          <Alert variant="error" title="Error" message={error} onClose={() => setError(null)} />
        )}

        {/* User Info */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            {isEditing ? (
              <Input
                value={editData.username || ''}
                onChange={(e) =>
                  setEditData({ ...editData, username: e.currentTarget.value })
                }
              />
            ) : (
              <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                {user.username}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            {isEditing ? (
              <Input
                type="email"
                value={editData.email || ''}
                onChange={(e) => setEditData({ ...editData, email: e.currentTarget.value })}
              />
            ) : (
              <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">{user.email}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            {isEditing ? (
              <select
                value={editData.role || 'user'}
                onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            ) : (
              <Badge variant={user.role === 'admin' ? 'danger' : user.role === 'moderator' ? 'warning' : 'success'}>
                {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
              </Badge>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="px-4 py-2 bg-gray-50 rounded-lg">
              <Badge variant={user.is_active ? 'success' : 'danger'}>
                {user.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Permissions */}
        {user.role && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Permissions</h3>
            <div className="space-y-2">
              {user.role === 'admin' && (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-4 h-4 bg-green-500 rounded"></span> Manage users
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-4 h-4 bg-green-500 rounded"></span> Manage projects
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-4 h-4 bg-green-500 rounded"></span> View activity logs
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-4 h-4 bg-green-500 rounded"></span> System settings
                  </div>
                </>
              )}
              {(user.role === 'admin' || user.role === 'moderator') && (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-4 h-4 bg-green-500 rounded"></span> Moderate content
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-4 h-4 bg-green-500 rounded"></span> View reports
                  </div>
                </>
              )}
              {user.role === 'user' && (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-4 h-4 bg-green-500 rounded"></span> Create projects
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-4 h-4 bg-green-500 rounded"></span> View own projects
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Created Date */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            User created on {new Date(user.created_at || Date.now()).toLocaleDateString()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          {isEditing ? (
            <>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                isLoading={isSaving}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
              {onSave && (
                <Button variant="primary" onClick={() => setIsEditing(true)}>
                  Edit User
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

UserDetailModal.displayName = 'UserDetailModal';
