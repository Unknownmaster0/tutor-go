'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useBookings } from '@/hooks/use-bookings';
import BookingList from '@/components/booking/booking-list';
import { apiClient } from '@/lib/api-client';

export default function BookingsPage() {
  const { user } = useAuth();
  const { bookings, isLoading, error, refetch } = useBookings(user?.id);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const handleCancelBooking = async (bookingId: string, reason?: string) => {
    try {
      setCancelingId(bookingId);
      await apiClient.patch(`/bookings/${bookingId}/cancel`, { reason });
      
      // Refresh the bookings list
      await refetch();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to cancel booking';
      throw new Error(errorMessage);
    } finally {
      setCancelingId(null);
    }
  };

  const handleViewDetails = (bookingId: string) => {
    // Navigate to booking details page
    window.location.href = `/booking/${bookingId}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Sign In</h2>
          <p className="text-gray-600">You need to sign in to view your bookings.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-2">
            View and manage your tutoring sessions
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="font-semibold text-red-800">Error Loading Bookings</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Bookings List */}
        {bookings && bookings.length > 0 ? (
          <BookingList
            bookings={bookings}
            onCancelBooking={handleCancelBooking}
            onViewDetails={handleViewDetails}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg
              className="w-12 h-12 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
            <p className="text-gray-600 mb-4">
              You haven't booked any tutoring sessions yet.
            </p>
            <a
              href="/search"
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Find a Tutor
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
