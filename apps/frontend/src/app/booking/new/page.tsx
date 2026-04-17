'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { BackButton } from '@/components/common/back-button';
import { TutorProfile } from '@/types/tutor.types';
import BookingForm from '@/components/booking/booking-form';
import { BookingFormData } from '@/types/booking.types';

export default function BookingNewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const tutorId = searchParams.get('tutorId');
  const dateParam = searchParams.get('date');
  const startParam = searchParams.get('start');
  const endParam = searchParams.get('end');

  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        if (!tutorId) {
          setError('Tutor ID is required');
          setLoading(false);
          return;
        }

        const tutorData = await apiClient.get<TutorProfile>(`/tutors/${tutorId}`);
        setTutor(tutorData);
      } catch (err: any) {
        console.error('Error fetching tutor:', err);
        setError(err.response?.data?.message || 'Failed to load tutor profile');
      } finally {
        setLoading(false);
      }
    };

    fetchTutor();
  }, [tutorId]);

  const handleSubmit = async (formData: BookingFormData) => {
    setSubmitting(true);
    try {
      // Use tutor.userId (PostgreSQL UUID) for booking, not MongoDB ObjectID
      const response = await apiClient.post('/bookings', {
        tutorId: tutor?.userId, // PostgreSQL User UUID, not MongoDB ObjectID
        subject: formData.subject,
        startTime: formData.startTime.toISOString(),
        endTime: formData.endTime.toISOString(),
        totalAmount: calculateAmount(formData.startTime, formData.endTime, tutor?.hourlyRate || 0),
        // Note: studentId is extracted from auth middleware in backend
      });

      // Redirect to payment page
      router.push(`/booking/${response?.id}/payment`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create booking';
      throw new Error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateAmount = (startTime: Date, endTime: Date, hourlyRate: number): number => {
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    return hours * hourlyRate;
  };

  const handleCancel = () => {
    if (tutorId) {
      router.push(`/tutors/${tutorId}`);
    } else {
      router.push('/search');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tutor profile...</p>
        </div>
      </div>
    );
  }

  if (error || !tutor) {
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Booking</h2>
          <p className="text-gray-600 mb-4">{error || 'Tutor profile not found'}</p>
          <button
            onClick={() => router.push('/search')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
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
        </div>

        {/* Booking Form */}
        <BookingForm 
          tutor={tutor} 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          preselectedDate={dateParam || undefined}
          preselectedStartTime={startParam || undefined}
          preselectedEndTime={endParam || undefined}
        />
      </div>
    </div>
  );
}
