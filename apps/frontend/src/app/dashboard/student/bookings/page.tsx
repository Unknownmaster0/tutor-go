'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, User, MapPin, MoreVertical, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api-client';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthContext } from '@/contexts/AuthContext';

interface Booking {
  id: string;
  tutorName: string;
  subject: string;
  sessionDate: string;
  sessionTime: string;
  sessionDuration: number;
  totalAmount: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  tutorImage?: string;
  sessionLink?: string;
}

export default function BookingsPage() {
  const { user } = useAuthContext();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled'
  >('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get<Booking[]>(`/bookings/user/${user?.id}`);

        if (response) {
          const bookingList = response || [];
          setBookings(
            bookingList.sort(
              (a: Booking, b: Booking) =>
                new Date(`${b.sessionDate}T${b.sessionTime}`).getTime() -
                new Date(`${a.sessionDate}T${a.sessionTime}`).getTime(),
            ),
          );
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to load bookings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings =
    filterStatus === 'all' ? bookings : bookings.filter((b) => b.status === filterStatus);

  const formatDate = (dateStr: string) => {
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setCancellingId(bookingId);
      const response = await apiClient.patch(`/bookings/${bookingId}/cancel`, {});

      if (response) {
        setBookings(
          bookings.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' as const } : b)),
        );
        toast.success('Booking cancelled successfully');
        setShowCancelModal(false);
        setSelectedBooking(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const handleJoinSession = (sessionLink?: string) => {
    if (sessionLink) {
      window.open(sessionLink, '_blank');
    } else {
      toast.error('Session link not available yet');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' };
      case 'pending':
        return { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' };
      case 'completed':
        return { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' };
      case 'cancelled':
        return { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '✓';
      case 'pending':
        return '⏳';
      case 'completed':
        return '✓✓';
      case 'cancelled':
        return '✗';
      default:
        return '•';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600 mt-1">View and manage your tutoring sessions</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filter Buttons */}
          <div className="mb-6 flex gap-2 flex-wrap">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Bookings List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading bookings...</p>
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const statusConfig = getStatusColor(booking.status);
                const isCancellable =
                  booking.status === 'confirmed' || booking.status === 'pending';

                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        {/* Booking Info */}
                        <div className="flex gap-4 flex-1">
                          {/* Avatar */}
                          {booking.tutorImage ? (
                            <img
                              src={booking.tutorImage}
                              alt={booking.tutorName}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                              {booking.tutorName.charAt(0)}
                            </div>
                          )}

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {booking.tutorName}
                            </h3>
                            <p className="text-blue-600 font-medium">{booking.subject}</p>

                            {/* Date, Time, Duration */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                {formatDate(booking.sessionDate)}
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-4 h-4" />
                                {formatTime(booking.sessionTime)}
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-4 h-4" />
                                {booking.sessionDuration} min
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex flex-col items-start md:items-end gap-3">
                          {/* Status Badge */}
                          <div
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.bg} ${statusConfig.text}`}
                          >
                            <span>{getStatusIcon(booking.status)}</span>
                            {getStatusLabel(booking.status)}
                          </div>

                          {/* Amount */}
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                              ${booking.totalAmount.toFixed(2)}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 flex-wrap justify-end">
                            {booking.status === 'confirmed' && booking.sessionLink && (
                              <button
                                onClick={() => handleJoinSession(booking.sessionLink)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                              >
                                Join Session
                              </button>
                            )}

                            {isCancellable && (
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setShowCancelModal(true);
                                }}
                                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center bg-white rounded-lg shadow p-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookings Found</h3>
              <p className="text-gray-600 mb-6">
                {filterStatus === 'all'
                  ? "You haven't booked any sessions yet"
                  : `You don't have any ${filterStatus} bookings`}
              </p>
              <a
                href="/search"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Find a Tutor
              </a>
            </div>
          )}
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Cancel Booking?</h3>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedBooking(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel your session with{' '}
                <strong>{selectedBooking.tutorName}</strong> on{' '}
                <strong>{formatDate(selectedBooking.sessionDate)}</strong> at{' '}
                <strong>{formatTime(selectedBooking.sessionTime)}</strong>?
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-blue-900">
                  You'll receive a full refund if you cancel at least 24 hours before the session.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedBooking(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Keep Booking
                </button>
                <button
                  onClick={() => handleCancelBooking(selectedBooking.id)}
                  disabled={cancellingId === selectedBooking.id}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancellingId === selectedBooking.id ? 'Cancelling...' : 'Cancel Session'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
