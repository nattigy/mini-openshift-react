'use client';

import React, { useState, useEffect } from 'react';
import { SettingsCard, Input, Alert } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/services/api';

export default function SettingsPage() {
  const { user } = useAuthStore();

  // Profile form state
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
  });
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  // Password form state
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Notification state
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize profile data
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
      });
    }
  }, [user]);

  // Initialize preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('emailNotifications');
    if (saved !== null) {
      setEmailNotifications(JSON.parse(saved));
    }
  }, []);

  // Clear notifications after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async () => {
    if (!user) return;

    setProfileSaving(true);
    setError(null);

    try {
      await apiClient.updateCurrentUser({
        username: profileData.username,
        email: profileData.email,
      });
      setSuccess('Profile updated successfully!');
      setProfileEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSave = async () => {
    if (!user) return;

    // Validate passwords
    if (!passwordData.old_password || !passwordData.new_password) {
      setError('Please fill in all password fields');
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setPasswordSaving(true);
    setError(null);

    try {
      await apiClient.changePassword(user.id, {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });
      setSuccess('Password changed successfully!');
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleEmailNotificationsToggle = () => {
    const newValue = !emailNotifications;
    setEmailNotifications(newValue);
    localStorage.setItem('emailNotifications', JSON.stringify(newValue));
    setSuccess('Email notification preferences updated!');
  };

  // const handleDeleteAccount = async () => {
  //   if (!user) return;

  //   if (!confirm('⚠️ WARNING: This will permanently delete your account and all associated data. This action cannot be undone. Are you absolutely sure?')) {
  //     return;
  //   }

  //   // Second confirmation
  //   const confirmText = prompt('Type "DELETE" in capital letters to confirm account deletion:');
  //   if (confirmText !== 'DELETE') {
  //     setError('Account deletion cancelled - confirmation text did not match');
  //     return;
  //   }

  //   try {
  //     await apiClient.deleteUser(user.id);
  //     setSuccess('Account deleted successfully. Redirecting...');

  //     // Logout and redirect after a short delay
  //     setTimeout(() => {
  //       useAuthStore.getState().logout();
  //       window.location.href = '/login';
  //     }, 2000);
  //   } catch (err: any) {
  //     setError(err.response?.data?.detail || 'Failed to delete account. Please contact support.');
  //   }
  // };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to access settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
      </div>

      {success && (
        <Alert
          variant="success"
          title="Success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}

      {error && (
        <Alert
          variant="error"
          title="Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Profile Settings */}
      <SettingsCard
        title="Profile Information"
        description="Update your profile details"
        showActions={profileEditing}
        onSave={handleProfileSave}
        onCancel={() => {
          setProfileEditing(false);
          setProfileData({
            username: user.username || '',
            email: user.email || '',
          });
        }}
        isSaving={profileSaving}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            {profileEditing ? (
              <Input
                type="text"
                name="username"
                value={profileData.username}
                onChange={handleProfileChange}
                placeholder="Enter your username"
              />
            ) : (
              <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                {profileData.username}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            {profileEditing ? (
              <Input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                placeholder="Enter your email"
              />
            ) : (
              <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                {profileData.email}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Status
            </label>
            <div className="px-4 py-2 bg-gray-50 rounded-lg">
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Active
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 capitalize">
              {user.role || 'user'}
            </div>
          </div>
        </div>

        {!profileEditing && (
          <div className="mt-6">
            <button
              onClick={() => setProfileEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Profile
            </button>
          </div>
        )}
      </SettingsCard>

      {/* Password Settings */}
      <SettingsCard
        title="Change Password"
        description="Update your password to keep your account secure"
        showActions={true}
        onSave={handlePasswordSave}
        onCancel={() => {
          setPasswordData({
            old_password: '',
            new_password: '',
            confirm_password: '',
          });
        }}
        isSaving={passwordSaving}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <Input
              type="password"
              name="old_password"
              value={passwordData.old_password}
              onChange={handlePasswordChange}
              placeholder="Enter your current password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <Input
              type="password"
              name="new_password"
              value={passwordData.new_password}
              onChange={handlePasswordChange}
              placeholder="Enter your new password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <Input
              type="password"
              name="confirm_password"
              value={passwordData.confirm_password}
              onChange={handlePasswordChange}
              placeholder="Confirm your new password"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Password requirements:</strong> At least 6 characters, use a mix of upper and lowercase letters, numbers, and symbols for better security.
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Account Preferences */}
      <SettingsCard
        title="Account Preferences"
        description="Customize how you use the application"
        showActions={false}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Receive email updates about your account</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              className="w-5 h-5 text-blue-600 rounded cursor-pointer"
              onChange={handleEmailNotificationsToggle}
            />
          </div>
        </div>
      </SettingsCard>

      {/* Danger Zone */}
      <SettingsCard
        title="Danger Zone"
        description="Irreversible actions"
        showActions={false}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between border-l-4 border-red-500 bg-red-50 p-4 rounded">
            <div>
              <label className="text-sm font-medium text-gray-900">Delete Account</label>
              <p className="text-sm text-gray-600 mt-1">Permanently delete your account and all associated data</p>
            </div>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              onClick={() => {
                if (confirm('Are you sure? This action cannot be undone.')) {
                  // TODO: Implement delete account
                  alert('Delete account not yet implemented');
                }
              }}
            >
              Delete Account
            </button>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
