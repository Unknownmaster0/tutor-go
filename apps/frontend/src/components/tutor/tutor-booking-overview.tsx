'use client';

import { useState, useEffect } from 'react';
import { Booking } from '@/types/booking.types';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface TutorBookingOverviewProps {
  tutorId: string;
}

interface EarningsStats {
  totalEarnings: number;
  thisMonthEarnings: number;
  completedSessions: number;
  upcomingSessions: number;
}

export function TutorBookingOverview({ tutorId }: TutorBookingOverviewProps) {
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<EarningsStats>({
    totalEarnings: 0,
    thisMonthEarnings: 0,
    completedSessions: 0,
    upcomingSessions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [tutorId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch upcoming bookings
      const bookingsData = await apiClient.get<{ bookings: Booking[] }>(
        `/bookings/tutor/${tutorId}?status=confirmed`
      );

      // Filter upcoming bookings (future dates)
      const now = new Date();
      const upcoming = bookingsData.bookings
        .filter((b) => new Date(b.startTime) > now)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, 5);

      setUpcomingBookings(upcoming);

      // Calculate stats
      const allBookings = await apiClient.get<{ bookings: Booking[] }>(
        `/bookings/tutor/${tutorId}`
      );

      const completed = allBookings.bookings.filter((b) => b.status === 'completed');
      const totalEarnings = completed.reduce((sum, b) => sum + b.totalAmount, 0);

      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const thisMonthCompleted = completed.filter(
        (b) => new Date(b.createdAt) >= thisMonth
      );
      const thisMonthEarnings = thisMonthCompleted.reduce((sum, b) => sum + b.totalAmount, 0);

      setStats({
        totalEarnings,
        thisMonthEarnings,
        completedSessions: completed.length,
        upcomingSessions: upcoming.length,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load booking data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${stats.totalEarnings.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${stats.thisMonthEarnings.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Sessions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completedSessions}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming Sessions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.upcomingSessions}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Sessions</h3>
            <Link
              href="/bookings"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </Link>
          </div>
        </div>

        <div className="p-6">
          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {booking.studentName?.charAt(0) || 'S'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{booking.studentName || 'Student'}</p>
                        <p className="text-sm text-gray-600">{booking.subject}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(booking.startTime)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        ${booking.totalAmount.toFixed(2)}
                      </p>
                    </div>

                    <Link
                      href={`/bookings/${booking.id}`}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-500">No upcoming sessions</p>
              <p className="text-sm text-gray-400 mt-1">
                Your upcoming bookings will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
