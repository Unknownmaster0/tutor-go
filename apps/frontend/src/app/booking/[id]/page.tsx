'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Booking } from '@/types/booking.types';

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const bookingId = params.id as string;
  const status = searchParams.get('status');

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const bookingData = await apiClient.get<Booking>(`/bookings/${bookingId}`);
        setBooking(bookingData);
      } catch (err: any) {
        console.error('Error fetching booking:', err);
        setError(err.response?.data?.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const getStatusColor = (bookingStatus: string) => {
    switch (bookingStatus) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <svg
            className="w-16 h-16 mx-auto text-red-500 mb-4"
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'Unable to load booking details'}</p>
          <button
            onClick={() => router.push('/bookings')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        {/* Success Message */}
        {status === 'success' && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="font-semibold text-green-800">Booking Created Successfully!</h3>
                <p className="text-sm text-green-700">Your booking is pending tutor confirmation.</p>
              </div>
            </div>
          </div>
        )}

        {/* Booking Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed</h2>
            <p className="text-gray-600">Booking ID: {bookingId}</p>
          </div>

          {/* Status Badge */}
          <div className="mb-6 flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}
            >
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>

          {/* Booking Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Date & Time */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Date</h3>
              <p className="text-lg text-gray-900">{formatDate(booking.startTime)}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Time</h3>
              <p className="text-lg text-gray-900">
                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
              </p>
            </div>

            {/* Subject */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Subject</h3>
              <p className="text-lg text-gray-900">{booking.subject}</p>
            </div>

            {/* Amount */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Total Amount</h3>
              <p className="text-lg font-semibold text-blue-600">${booking.totalAmount.toFixed(2)}</p>
            </div>
          </div>

          {/* Tutor Info */}
          {booking.tutorName && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Tutor</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {booking.tutorName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{booking.tutorName}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/bookings')}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              View All Bookings
            </button>
            <button
              onClick={() => router.push('/search')}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Book Another Session
            </button>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Next Steps</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Your booking request has been sent to the tutor</li>
            <li>✓ The tutor will confirm your booking shortly</li>
            <li>✓ You'll receive a notification once confirmed</li>
            <li>✓ Payment will be processed after the session is completed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
