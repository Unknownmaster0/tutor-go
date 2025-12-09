'use client';

import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { TutorBookingOverview } from '@/components/tutor/tutor-booking-overview';
import Link from 'next/link';

function TutorDashboardContent() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">TutorGo</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.name}
              </span>
              <button
                onClick={logout}
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Tutor Dashboard
            </h2>
            <p className="text-gray-600 mb-6">
              Manage your profile, availability, and bookings.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/dashboard/tutor/profile"
                className="block p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
              >
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  My Profile
                </h3>
                <p className="text-sm text-blue-700">
                  Update your profile and demo videos
                </p>
              </Link>

              <Link
                href="/dashboard/tutor/availability"
                className="block p-6 bg-green-50 rounded-lg hover:bg-green-100 transition"
              >
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Availability
                </h3>
                <p className="text-sm text-green-700">
                  Set your available time slots
                </p>
              </Link>

              <Link
                href="/bookings"
                className="block p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
              >
                <h3 className="text-lg font-semibold text-purple-900 mb-2">
                  My Sessions
                </h3>
                <p className="text-sm text-purple-700">
                  View upcoming and past sessions
                </p>
              </Link>

              <Link
                href="/chat"
                className="block p-6 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition"
              >
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                  Messages
                </h3>
                <p className="text-sm text-yellow-700">
                  Chat with your students
                </p>
              </Link>
            </div>
          </div>

          {/* Booking Overview */}
          {user?.id && <TutorBookingOverview tutorId={user.id} />}
        </div>
      </main>
    </div>
  );
}

export default function TutorDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['tutor']}>
      <TutorDashboardContent />
    </ProtectedRoute>
  );
}
