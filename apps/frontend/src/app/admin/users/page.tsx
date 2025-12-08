'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { User } from '@/types/admin.types';
import { UserSearch, UserFilters } from '@/components/admin/user-search';
import { UserList } from '@/components/admin/user-list';
import { UserDetailsModal } from '@/components/admin/user-details-modal';

export default function UserManagement() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<UserFilters>({});

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.get<{
          users: User[];
          total: number;
          page: number;
          totalPages: number;
        }>('/admin/users');
        setUsers(Array.isArray(data.users) ? data.users : []);
        setFilteredUsers(Array.isArray(data.users) ? data.users : []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  useEffect(() => {
    let result = [...users];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (u) => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query),
      );
    }

    // Apply role filter
    if (filters.role) {
      result = result.filter((u) => u.role === filters.role);
    }

    // Apply status filter
    if (filters.status) {
      if (filters.status === 'active') {
        result = result.filter((u) => !u.suspended && u.emailVerified);
      } else if (filters.status === 'suspended') {
        result = result.filter((u) => u.suspended);
      } else if (filters.status === 'unverified') {
        result = result.filter((u) => !u.emailVerified && !u.suspended);
      }
    }

    setFilteredUsers(result);
  }, [searchQuery, filters, users]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: UserFilters) => {
    setFilters(newFilters);
  };

  const handleSuspend = async (userId: string, reason: string) => {
    try {
      await apiClient.patch(`/admin/users/${userId}/suspend`, { reason });

      // Update local state
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, suspended: true } : u)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to suspend user');
    }
  };

  const handleViewDetails = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setSelectedUser(user);
    }
  };

  const handleCloseDetails = () => {
    setSelectedUser(null);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="user-management">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">Manage user accounts and permissions</p>
        </div>

        <UserSearch onSearch={handleSearch} onFilterChange={handleFilterChange} />

        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </div>

        <UserList
          users={filteredUsers}
          onSuspend={handleSuspend}
          onViewDetails={handleViewDetails}
        />

        <UserDetailsModal user={selectedUser} onClose={handleCloseDetails} />
      </div>
    </div>
  );
}
