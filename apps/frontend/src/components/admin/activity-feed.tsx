'use client';

import React from 'react';
import { RecentActivity } from '@/types/admin.types';

interface ActivityFeedProps {
  activities: RecentActivity[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'booking':
        return '📅';
      case 'payment':
        return '💳';
      case 'review':
        return '⭐';
      case 'user':
        return '👤';
      default:
        return '📌';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6" data-testid="activity-feed">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      {activities.length === 0 ? (
        <p className="text-gray-500">No recent activity</p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0"
              data-testid={`activity-item-${activity.id}`}
            >
              <span className="text-2xl" data-testid={`activity-icon-${activity.id}`}>
                {getActivityIcon(activity.type)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900" data-testid={`activity-description-${activity.id}`}>
                  {activity.description}
                </p>
                {activity.userName && (
                  <p className="text-xs text-gray-500 mt-1" data-testid={`activity-user-${activity.id}`}>
                    {activity.userName}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1" data-testid={`activity-time-${activity.id}`}>
                  {formatTimestamp(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
