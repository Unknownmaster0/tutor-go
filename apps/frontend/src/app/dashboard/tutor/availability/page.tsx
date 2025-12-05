'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { AvailabilityManager } from '@/components/tutor/availability-manager';
import { apiClient } from '@/lib/api-client';
import { TutorProfile } from '@/types/tutor.types';
import Link from 'next/link';

function TutorAvailabilityContent() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get<TutorProfile>(`/tutors/profile/${user.id}`);
      setProfile(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading availability...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/tutor" className="text-xl font-bold text-gray-900">
                TutorGo
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Availability Management</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {profile && <AvailabilityManager profile={profile} onUpdate={loadProfile} />}
        </div>
      </main>
    </div>
  );
}

export default function TutorAvailabilityPage() {
  return (
    <ProtectedRoute allowedRoles={['tutor']}>
      <TutorAvailabilityContent />
    </ProtectedRoute>
  );
}
