'use client';

import React, { useState } from 'react';
import { FlaggedContent, ModerationAction } from '@/types/admin.types';

interface FlaggedContentListProps {
  content: FlaggedContent[];
  onModerate: (contentId: string, action: ModerationAction) => void;
}

export const FlaggedContentList: React.FC<FlaggedContentListProps> = ({
  content,
  onModerate,
}) => {
  const [moderatingId, setModeratingId] = useState<string | null>(null);
  const [actionReason, setActionReason] = useState('');

  const handleActionClick = (contentId: string, action: 'approve' | 'remove' | 'warn') => {
    if (action === 'approve') {
      onModerate(contentId, { action });
    } else {
      setModeratingId(contentId);
      setActionReason('');
    }
  };

  const handleActionConfirm = (action: 'remove' | 'warn') => {
    if (moderatingId) {
      onModerate(moderatingId, { action, reason: actionReason || undefined });
      setModeratingId(null);
      setActionReason('');
    }
  };

  const handleActionCancel = () => {
    setModeratingId(null);
    setActionReason('');
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'removed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'review':
        return 'bg-blue-100 text-blue-800';
      case 'message':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (content.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6" data-testid="flagged-content-list">
        <p className="text-gray-500">No flagged content</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="flagged-content-list">
      {content.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-lg shadow p-6"
          data-testid={`content-item-${item.id}`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(
                  item.type
                )}`}
                data-testid={`content-type-${item.id}`}
              >
                {item.type}
              </span>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                  item.status
                )}`}
                data-testid={`content-status-${item.id}`}
              >
                {item.status}
              </span>
            </div>
            <span className="text-sm text-gray-500" data-testid={`content-date-${item.id}`}>
              {new Date(item.reportedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Content:</p>
            <div
              className="bg-gray-50 rounded p-3 text-sm text-gray-900"
              data-testid={`content-text-${item.id}`}
            >
              {item.content}
            </div>
          </div>

          <div className="mb-4 text-sm text-gray-600">
            <p data-testid={`content-reporter-${item.id}`}>
              Reported by: <span className="font-medium">{item.reportedBy}</span>
            </p>
            {item.tutorId && (
              <p data-testid={`content-tutor-${item.id}`}>
                Tutor ID: <span className="font-mono">{item.tutorId}</span>
              </p>
            )}
            {item.studentId && (
              <p data-testid={`content-student-${item.id}`}>
                Student ID: <span className="font-mono">{item.studentId}</span>
              </p>
            )}
          </div>

          {item.status === 'pending' && (
            <div className="flex space-x-3">
              <button
                onClick={() => handleActionClick(item.id, 'approve')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                data-testid={`approve-button-${item.id}`}
              >
                Approve
              </button>
              <button
                onClick={() => handleActionClick(item.id, 'warn')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm"
                data-testid={`warn-button-${item.id}`}
              >
                Warn User
              </button>
              <button
                onClick={() => handleActionClick(item.id, 'remove')}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                data-testid={`remove-button-${item.id}`}
              >
                Remove
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Action Confirmation Modal */}
      {moderatingId && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
          data-testid="moderation-modal"
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Action</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for this moderation action (optional):
            </p>
            <textarea
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 mb-4"
              rows={4}
              placeholder="Enter reason..."
              data-testid="action-reason-input"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleActionCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                data-testid="action-cancel-button"
              >
                Cancel
              </button>
              <button
                onClick={() => handleActionConfirm('warn')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                data-testid="action-warn-confirm"
              >
                Warn
              </button>
              <button
                onClick={() => handleActionConfirm('remove')}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                data-testid="action-remove-confirm"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
