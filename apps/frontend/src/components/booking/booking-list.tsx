'use client';

import { useState } from 'react';
import { Booking, BookingStatus, BookingFilters } from '@/types/booking.types';

interface BookingListProps {
  bookings: Booking[];
  onCancelBooking?: (bookingId: string) => void;
  onViewDetails?: (bookingId: string) => void;
}

export default function BookingList({
  bookings,
  onCancelBooking,
  onViewDetails,
}: BookingListProps) {
  const [filters, setFilters] = useState<BookingFilters>({});
  const [activeTab, setActiveTab] = useState<'all' | BookingStatus>('all');

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: BookingStatus): string => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab !== 'all' && booking.status !== activeTab) {
      return false;
    }

    if (filters.subject && booking.subject !== filters.subject) {
      return false;
    }

    if (filters.startDate) {
      const bookingDate = new Date(booking.startTime);
      const filterDate = new Date(filters.startDate);
      if (bookingDate < filterDate) {
        return false;
      }
    }

    if (filters.endDate) {
      const bookingDate = new Date(booking.startTime);
      const filterDate = new Date(filters.endDate);
      if (bookingDate > filterDate) {
        return false;
      }
    }

    return true;
  });

  const getBookingCounts = () => {
    return {
      all: bookings.length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      completed: bookings.filter((b) => b.status === 'completed').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    };
  };

  const counts = getBookingCounts();

  const canCancelBooking = (booking: Booking): boolean => {
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return false;
    }

    // Check if booking is at least 24 hours away
    const bookingTime = new Date(booking.startTime).getTime();
    const now = Date.now();
    const hoursUntilBooking = (bookingTime - now) / (1000 * 60 * 60);

    return hoursUntilBooking >= 24;
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { key: 'all', label: 'All', count: counts.all },
            { key: 'pending', label: 'Pending', count: counts.pending },
            { key: 'confirmed', label: 'Upcoming', count: counts.confirmed },
            { key: 'completed', label: 'Completed', count: counts.completed },
            { key: 'cancelled', label: 'Cancelled', count: counts.cancelled },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className="ml-2 py-0.5 px-2 rounded-full bg-gray-100 text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="subject-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <select
              id="subject-filter"
              value={filters.subject || ''}
              onChange={(e) => setFilters({ ...filters, subject: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Subjects</option>
              {Array.from(new Set(bookings.map((b) => b.subject))).map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="start-date-filter" className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              id="start-date-filter"
              value={filters.startDate ? new Date(filters.startDate).toISOString().split('T')[0] : ''}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value ? new Date(e.target.value) : undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="end-date-filter" className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              id="end-date-filter"
              value={filters.endDate ? new Date(filters.endDate).toISOString().split('T')[0] : ''}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value ? new Date(e.target.value) : undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {(filters.subject || filters.startDate || filters.endDate) && (
          <button
            onClick={() => setFilters({})}
            className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Booking List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">No bookings found</p>
            <p className="text-gray-400 text-sm mt-2">
              {activeTab !== 'all' ? `You have no ${activeTab} bookings` : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {booking.tutorName || booking.studentName || 'Booking'}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Subject:</span> {booking.subject}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span> {formatDate(booking.startTime)}
                    </p>
                    <p>
                      <span className="font-medium">Time:</span> {formatTime(booking.startTime)} -{' '}
                      {formatTime(booking.endTime)}
                    </p>
                    <p>
                      <span className="font-medium">Amount:</span> ${booking.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {onViewDetails && (
                    <button
                      onClick={() => onViewDetails(booking.id)}
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                  )}
                  {onCancelBooking && canCancelBooking(booking) && (
                    <button
                      onClick={() => onCancelBooking(booking.id)}
                      className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
