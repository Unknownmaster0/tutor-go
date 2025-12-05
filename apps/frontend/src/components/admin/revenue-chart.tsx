'use client';

import React from 'react';
import { RevenueData } from '@/types/admin.types';

interface RevenueChartProps {
  data: RevenueData[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6" data-testid="revenue-chart">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Over Time</h3>
        <p className="text-gray-500">No revenue data available</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue));
  const chartHeight = 200;

  return (
    <div className="bg-white rounded-lg shadow p-6" data-testid="revenue-chart">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Over Time</h3>
      <div className="relative" style={{ height: chartHeight }}>
        <div className="flex items-end justify-between h-full space-x-2">
          {data.map((item, index) => {
            const barHeight = maxRevenue > 0 ? (item.revenue / maxRevenue) * chartHeight : 0;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                  style={{ height: `${barHeight}px` }}
                  data-testid={`revenue-bar-${index}`}
                  title={`$${item.revenue.toFixed(2)}`}
                />
                <p className="text-xs text-gray-600 mt-2 text-center" data-testid={`revenue-label-${index}`}>
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex justify-between text-sm text-gray-600">
        <span>Total: ${data.reduce((sum, d) => sum + d.revenue, 0).toFixed(2)}</span>
        <span>Avg: ${(data.reduce((sum, d) => sum + d.revenue, 0) / data.length).toFixed(2)}</span>
      </div>
    </div>
  );
};
