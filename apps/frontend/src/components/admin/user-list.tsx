'use client';

import React, { useState } from 'react';
import { User } from '@/types/admin.types';

interface UserListProps {
  users: User[];
  onSuspend: (userId: string, reason: string) => void;
  onViewDetails: (userId: string) => void;
}

export const UserList: React.FC<UserListProps> = ({ users, onSuspend, onViewDetails }) => {
  const [suspendingUserId, setSuspendingUserId] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  const handleSuspendClick = (userId: string) => {
    setSuspendingUserId(userId);
    setSuspendReason('');
  };

  const handleSuspendConfirm = () => {
    if (suspendingUserId && suspendReason.trim()) {
      onSuspend(suspendingUserId, suspendReason);
      setSuspendingUserId(null);
      setSuspendReason('');
    }
  };

  const handleSuspendCancel = () => {
    setSuspendingUserId(null);
    setSuspendReason('');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'tutor':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6" data-testid="user-list">
        <p className="text-gray-500">No users found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden" data-testid="user-list">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Joined
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} data-testid={`user-row-${user.id}`}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900" data-testid={`user-name-${user.id}`}>
                    {user.name}
                  </div>
                  <div className="text-sm text-gray-500" data-testid={`user-email-${user.id}`}>
                    {user.email}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(
                    user.role
                  )}`}
                  data-testid={`user-role-${user.id}`}
                >
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.suspended
                      ? 'bg-red-100 text-red-800'
                      : user.emailVerified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                  data-testid={`user-status-${user.id}`}
                >
                  {user.suspended ? 'Suspended' : user.emailVerified ? 'Active' : 'Unverified'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-testid={`user-joined-${user.id}`}>
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onViewDetails(user.id)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                  data-testid={`view-details-${user.id}`}
                >
                  View
                </button>
                {!user.suspended && (
                  <button
                    onClick={() => handleSuspendClick(user.id)}
                    className="text-red-600 hover:text-red-900"
                    data-testid={`suspend-button-${user.id}`}
                  >
                    Suspend
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Suspend Modal */}
      {suspendingUserId && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
          data-testid="suspend-modal"
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Suspend User</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for suspending this user:
            </p>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 mb-4"
              rows={4}
              placeholder="Enter suspension reason..."
              data-testid="suspend-reason-input"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleSuspendCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                data-testid="suspend-cancel-button"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspendConfirm}
                disabled={!suspendReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="suspend-confirm-button"
              >
                Suspend
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
