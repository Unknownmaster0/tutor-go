'use client';

import React from 'react';
import { User } from '@/types/admin.types';

interface UserDetailsModalProps {
  user: User | null;
  onClose: () => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
      data-testid="user-details-modal"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-900" data-testid="modal-title">
            User Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            data-testid="close-button"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="text-sm font-medium text-gray-900" data-testid="detail-name">
                  {user.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-sm font-medium text-gray-900" data-testid="detail-email">
                  {user.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="text-sm font-medium text-gray-900" data-testid="detail-role">
                  {user.role}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">User ID</p>
                <p className="text-sm font-medium text-gray-900 font-mono" data-testid="detail-id">
                  {user.id}
                </p>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email Verified</p>
                <p
                  className={`text-sm font-medium ${
                    user.emailVerified ? 'text-green-600' : 'text-yellow-600'
                  }`}
                  data-testid="detail-verified"
                >
                  {user.emailVerified ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Status</p>
                <p
                  className={`text-sm font-medium ${
                    user.suspended ? 'text-red-600' : 'text-green-600'
                  }`}
                  data-testid="detail-suspended"
                >
                  {user.suspended ? 'Suspended' : 'Active'}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Activity</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Joined</p>
                <p className="text-sm font-medium text-gray-900" data-testid="detail-created">
                  {new Date(user.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-sm font-medium text-gray-900" data-testid="detail-updated">
                  {new Date(user.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Activity Summary (Placeholder) */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Activity Summary</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                {user.role === 'tutor' && 'Total sessions, earnings, and ratings would appear here.'}
                {user.role === 'student' && 'Total bookings and reviews would appear here.'}
                {user.role === 'admin' && 'Admin activity logs would appear here.'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            data-testid="close-modal-button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
