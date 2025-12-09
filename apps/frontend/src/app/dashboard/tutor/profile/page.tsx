'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { ProfileEditForm } from '@/components/tutor/profile-edit-form';
import { VideoUpload } from '@/components/tutor/video-upload';
import { SubjectManager } from '@/components/tutor/subject-manager';
import { QualificationManager } from '@/components/tutor/qualification-manager';
import { apiClient } from '@/lib/api-client';
import { TutorProfile } from '@/types/tutor.types';
import Link from 'next/link';

function TutorProfileManagementContent() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'videos' | 'subjects' | 'qualifications'>('profile');

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get<TutorProfile>(`/tutors/profile`);
      setProfile(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedProfile: Partial<TutorProfile>) => {
    try {
      const data = await apiClient.put<TutorProfile>('/tutors/profile', updatedProfile);
      setProfile(data);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || 'Failed to update profile' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
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
              <span className="text-gray-600">Profile Management</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'profile'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Profile Info
                </button>
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'videos'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Demo Videos
                </button>
                <button
                  onClick={() => setActiveTab('subjects')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'subjects'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Subjects
                </button>
                <button
                  onClick={() => setActiveTab('qualifications')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'qualifications'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Qualifications
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'profile' && profile && (
                <ProfileEditForm profile={profile} onUpdate={handleProfileUpdate} />
              )}
              {activeTab === 'videos' && profile && (
                <VideoUpload profile={profile} onUpdate={loadProfile} />
              )}
              {activeTab === 'subjects' && profile && (
                <SubjectManager profile={profile} onUpdate={handleProfileUpdate} />
              )}
              {activeTab === 'qualifications' && profile && (
                <QualificationManager profile={profile} onUpdate={handleProfileUpdate} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TutorProfileManagementPage() {
  return (
    <ProtectedRoute allowedRoles={['tutor']}>
      <TutorProfileManagementContent />
    </ProtectedRoute>
  );
}
