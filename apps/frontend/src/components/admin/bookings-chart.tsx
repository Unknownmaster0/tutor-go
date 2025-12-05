'use client';

import React from 'react';
import { BookingData } from '@/types/admin.types';

interface BookingsChartProps {
  data: BookingData[];
}

export const BookingsChart: React.FC<BookingsChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6" data-testid="bookings-chart">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookings Over Time</h3>
        <p className="text-gray-500">No booking data available</p>
      </div>
    );
  }

  const maxBookings = Math.max(...data.map((d) => d.bookings));
  const chartHeight = 200;

  return (
    <div className="bg-white rounded-lg shadow p-6" data-testid="bookings-chart">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookings Over Time</h3>
      <div className="relative" style={{ height: chartHeight }}>
        <div className="flex items-end justify-between h-full space-x-2">
          {data.map((item, index) => {
            const barHeight = maxBookings > 0 ? (item.bookings / maxBookings) * chartHeight : 0;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-green-500 rounded-t hover:bg-green-600 transition-colors"
                  style={{ height: `${barHeight}px` }}
                  data-testid={`booking-bar-${index}`}
                  title={`${item.bookings} bookings`}
                />
                <p className="text-xs text-gray-600 mt-2 text-center" data-testid={`booking-label-${index}`}>
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex justify-between text-sm text-gray-600">
        <span>Total: {data.reduce((sum, d) => sum + d.bookings, 0)}</span>
        <span>Avg: {(data.reduce((sum, d) => sum + d.bookings, 0) / data.length).toFixed(1)}</span>
      </div>
    </div>
  );
};
