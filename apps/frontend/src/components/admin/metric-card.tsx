'use client';

import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6" data-testid="metric-card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600" data-testid="metric-title">
            {title}
          </p>
          <p className="mt-2 text-3xl font-semibold text-gray-900" data-testid="metric-value">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500" data-testid="metric-subtitle">
              {subtitle}
            </p>
          )}
          {trend && (
            <div
              className={`mt-2 flex items-center text-sm ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
              data-testid="metric-trend"
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span className="ml-1">{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="ml-4 text-gray-400" data-testid="metric-icon">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
