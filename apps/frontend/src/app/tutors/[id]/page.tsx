'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { VideoPlayer } from '@/components/video/video-player';
import { ReviewCard } from '@/components/review/review-card';
import { AvailabilityCalendar } from '@/components/calendar/availability-calendar';
import { TutorProfile } from '@/types/tutor.types';
import { apiClient } from '@/lib/api-client';

interface Review {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function TutorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const tutorId = params.id as string;

  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'about' | 'reviews'>('about');

  useEffect(() => {
    const fetchTutorProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tutor profile
        const tutorData = await apiClient.get<TutorProfile>(`/tutors/${tutorId}`);
        setTutor(tutorData);

        // Fetch reviews
        const reviewsData = await apiClient.get<{ reviews: Review[] }>(`/reviews/tutor/${tutorId}`);
        setReviews(reviewsData.reviews || []);
      } catch (err: any) {
        console.error('Error fetching tutor profile:', err);
        setError(err.response?.data?.message || 'Failed to load tutor profile');
      } finally {
        setLoading(false);
      }
    };

    if (tutorId) {
      fetchTutorProfile();
    }
  }, [tutorId]);

  const handleBookSession = () => {
    if (tutor) {
      router.push(`/booking/new?tutorId=${tutor.id}`);
    }
  };

  const handleSlotSelect = (date: Date, slot: any) => {
    if (tutor) {
      router.push(`/booking/new?tutorId=${tutor.id}&date=${date.toISOString()}&start=${slot.startTime}&end=${slot.endTime}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tutor profile...</p>
        </div>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The tutor profile you are looking for does not exist.'}</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Search
          </button>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-5xl font-bold">
                {tutor.name.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{tutor.name}</h1>
              
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                  <span className="ml-1 text-lg font-semibold text-gray-900">
                    {tutor.rating.toFixed(1)}
                  </span>
                  <span className="ml-2 text-gray-600">
                    ({tutor.totalReviews} {tutor.totalReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>

                <div className="flex items-center gap-1 text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{tutor.location.address}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl font-bold text-blue-600">${tutor.hourlyRate}</span>
                <span className="text-gray-600">per hour</span>
              </div>

              <button
                onClick={handleBookSession}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Book a Session
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Demo Videos */}
            {tutor.demoVideos && tutor.demoVideos.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Demo Videos</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {tutor.demoVideos.map((video, index) => (
                    <VideoPlayer
                      key={index}
                      url={video}
                      title={`Demo Video ${index + 1}`}
                      className="aspect-video"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('about')}
                    className={`px-6 py-4 font-medium ${
                      activeTab === 'about'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    About
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`px-6 py-4 font-medium ${
                      activeTab === 'reviews'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Reviews ({tutor.totalReviews})
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'about' ? (
                  <div className="space-y-6">
                    {/* Bio */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">About Me</h3>
                      <p className="text-gray-700 leading-relaxed">{tutor.bio}</p>
                    </div>

                    {/* Qualifications */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Qualifications</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {tutor.qualifications.map((qual, index) => (
                          <li key={index} className="text-gray-700">{qual}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Subjects */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Subjects I Teach</h3>
                      <div className="flex flex-wrap gap-2">
                        {tutor.subjects.map((subject, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg"
                          >
                            <div className="font-medium text-blue-900">{subject.name}</div>
                            <div className="text-xs text-blue-600 capitalize">{subject.proficiency}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.length > 0 ? (
                      reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <p>No reviews yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <AvailabilityCalendar
              availability={[
                { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
                { dayOfWeek: 1, startTime: '14:00', endTime: '17:00' },
                { dayOfWeek: 3, startTime: '10:00', endTime: '15:00' },
                { dayOfWeek: 5, startTime: '09:00', endTime: '16:00' },
              ]}
              onSlotSelect={handleSlotSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
