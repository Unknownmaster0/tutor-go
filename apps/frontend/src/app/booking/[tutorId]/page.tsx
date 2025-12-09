'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BookingFlow } from '@/components/booking/BookingFlow';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api-client';

interface TutorInfo {
  id: string;
  name: string;
  profileImage?: string;
  hourlyRate: number;
  expertise: string[];
}

export default function BookingPage() {
  const params = useParams();
  const tutorId = params.tutorId as string;
  const selectedSubject = (params.subject as string) || 'General';

  const [tutorInfo, setTutorInfo] = useState<TutorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTutorInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.get<TutorInfo>(`tutors/${tutorId}`);

        if (response) {
          setTutorInfo(response);
        } else {
          setError('Failed to load tutor information');
        }
      } catch (err: any) {
        console.error('Error fetching tutor info:', err);
        setError(err.response?.data?.message || 'Failed to load tutor information');
      } finally {
        setIsLoading(false);
      }
    };

    if (tutorId) {
      fetchTutorInfo();
    }
  }, [tutorId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tutor information...</p>
        </div>
      </div>
    );
  }

  if (error || !tutorInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white rounded-lg shadow p-8 max-w-md">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load</h2>
          <p className="text-gray-600 mb-6">{error || 'Tutor information not found'}</p>
          <a
            href="/search"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Search
          </a>
        </div>
      </div>
    );
  }

  return (
    <BookingFlow
      tutorId={tutorInfo.id}
      tutorName={tutorInfo.name}
      tutorImage={tutorInfo.profileImage}
      hourlyRate={tutorInfo.hourlyRate}
      subject={selectedSubject}
    />
  );
}
