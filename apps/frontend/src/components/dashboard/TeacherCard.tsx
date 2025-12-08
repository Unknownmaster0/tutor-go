import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Teacher } from '@/types/dashboard.types';

export interface TeacherCardProps {
  teacher: Teacher;
  onClick?: (teacherId: string) => void;
}

export const TeacherCard: React.FC<TeacherCardProps> = ({ teacher, onClick }) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick(teacher.id);
    } else {
      router.push(`/tutors/${teacher.id}`);
    }
  };

  // Normalize subjects array - handle both string[] and object[] formats
  const subjects = Array.isArray(teacher.subjects)
    ? teacher.subjects.map((s) => (typeof s === 'string' ? s : s.name))
    : [];

  // Format rating to 1 decimal place
  const formattedRating = teacher.rating.toFixed(1);

  return (
    <Card
      hover
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
      className="flex flex-col h-full cursor-pointer"
      aria-label={`${teacher.name}, rating ${formattedRating}, ${teacher.hourlyRate} per hour`}
    >
      <div className="flex items-start gap-4 mb-4">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          {teacher.profilePicture ? (
            <img
              src={teacher.profilePicture}
              alt={`${teacher.name}'s profile picture`}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center"
              aria-hidden="true"
            >
              <span className="text-primary-600 text-xl font-semibold">
                {teacher.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Teacher Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-neutral-900 truncate mb-1">{teacher.name}</h3>

          {/* Rating */}
          <div
            className="flex items-center gap-1 mb-2"
            aria-label={`Rating: ${formattedRating} out of 5`}
          >
            <svg
              className="w-4 h-4 text-warning"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium text-neutral-700">{formattedRating}</span>
            <span className="text-sm text-neutral-500">
              ({teacher.totalReviews} {teacher.totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          {/* Hourly Rate */}
          <div className="text-lg font-bold text-primary-600">
            <span aria-label="Hourly rate">${teacher.hourlyRate}/hr</span>
          </div>
        </div>
      </div>

      {/* Subjects */}
      <div className="mt-auto">
        <div className="flex flex-wrap gap-2" role="list" aria-label="Specialties">
          {subjects.slice(0, 3).map((subject, index) => (
            <span
              key={index}
              role="listitem"
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700"
            >
              {subject}
            </span>
          ))}
          {subjects.length > 3 && (
            <span
              role="listitem"
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600"
            >
              +{subjects.length - 3} more
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
