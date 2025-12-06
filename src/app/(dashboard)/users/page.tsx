'use client';

import { useEffect, useState } from 'react';
import { Card, Badge, Loading, Alert, Button, SearchBar, Pagination } from '@/components';
import { CreateUserModal } from '@/components/CreateUserModal';
import { UserDetailModal } from '@/components/UserDetailModal';
import { apiClient } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

interface User {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  role: string;
  created_at?: string;
}

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Search and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Deleting state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search query
    if (searchQuery.trim()) {
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
    setCurrentPage(1); // Reset to first page on search
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getUsers(0, 100);
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (data: any) => {
    try {
      await apiClient.createUser(data);
      setSuccess('User created successfully!');
      await fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      throw err; // Let modal handle the error
    }
  };

  const handleUpdateUser = async (userData: Partial<User>) => {
    if (!selectedUser) return;

    try {
      await apiClient.updateUser(selectedUser.id, {
        username: userData.username,
        email: userData.email,
        role: userData.role,
      });
      setSuccess('User updated successfully!');
      await fetchUsers();
      setIsDetailModalOpen(false);
      setSelectedUser(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      throw err; // Let modal handle the error
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setDeletingId(userId);
    try {
      await apiClient.deleteUser(userId);
      setSuccess('User deleted successfully!');
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete user');
      setTimeout(() => setError(''), 3000);
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-2">Manage system users and their access</p>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            + New User
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="error" message={error} onClose={() => setError('')} />
      )}

      {success && (
        <Alert variant="success" message={success} onClose={() => setSuccess('')} />
      )}

      {/* Search Bar */}
      <div className="flex justify-between items-center">
        <SearchBar
          onSearch={setSearchQuery}
          placeholder="Search users by name or email..."
        />
        <div className="text-sm text-gray-600">
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
        </div>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loading size="lg" label="Loading users..." />
          </div>
        ) : currentUsers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              {searchQuery ? 'No users found matching your search' : 'No users yet'}
            </p>
            {isAdmin && !searchQuery && (
              <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                Create First User
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <Badge variant={user.role === 'admin' ? 'danger' : 'info'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={user.is_active ? 'success' : 'warning'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewUser(user)}
                        >
                          View
                        </Button>
                        {isAdmin && user.id !== currentUser?.id && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            isLoading={deletingId === user.id}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateUser}
      />

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={isAdmin ? handleUpdateUser : undefined}
      />
    </div>
  );
}
