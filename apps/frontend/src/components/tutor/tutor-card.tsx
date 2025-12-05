'use client';

import Link from 'next/link';
import { TutorProfile } from '@/types/tutor.types';

interface TutorCardProps {
  tutor: TutorProfile;
  className?: string;
}

export function TutorCard({ tutor, className = '' }: TutorCardProps) {
  return (
    <Link href={`/tutors/${tutor.id}`}>
      <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer ${className}`}>
        <div className="flex gap-4">
          {/* Profile Image Placeholder */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {tutor.name.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Tutor Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {tutor.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                    <span className="ml-1 text-sm font-medium text-gray-700">
                      {tutor.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    ({tutor.totalReviews} {tutor.totalReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  ${tutor.hourlyRate}
                </div>
                <div className="text-xs text-gray-500">per hour</div>
              </div>
            </div>

            {/* Bio */}
            <p className="mt-3 text-sm text-gray-600 line-clamp-2">
              {tutor.bio}
            </p>

            {/* Subjects */}
            <div className="mt-3 flex flex-wrap gap-2">
              {tutor.subjects.slice(0, 3).map((subject, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {subject.name}
                </span>
              ))}
              {tutor.subjects.length > 3 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  +{tutor.subjects.length - 3} more
                </span>
              )}
            </div>

            {/* Location & Distance */}
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{tutor.location.address}</span>
              </div>
              {tutor.distance !== undefined && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>{tutor.distance.toFixed(1)} km away</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
