import React from 'react';
import { Card } from '@/components/ui/Card';
import { Booking, BookingStatus } from '@/types/booking.types';
import { format } from 'date-fns';

export interface BookingHistoryCardProps {
  booking: Booking;
  onClick?: (bookingId: string) => void;
}

const statusConfig: Record<BookingStatus, { label: string; bgColor: string; textColor: string }> = {
  pending: {
    label: 'Pending',
    bgColor: 'bg-warning/10',
    textColor: 'text-warning',
  },
  confirmed: {
    label: 'Confirmed',
    bgColor: 'bg-primary-50',
    textColor: 'text-primary-700',
  },
  completed: {
    label: 'Completed',
    bgColor: 'bg-success/10',
    textColor: 'text-success',
  },
  cancelled: {
    label: 'Cancelled',
    bgColor: 'bg-error/10',
    textColor: 'text-error',
  },
};

export const BookingHistoryCard: React.FC<BookingHistoryCardProps> = ({ booking, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(booking.id);
    }
  };

  const statusInfo = statusConfig[booking.status];
  const formattedDate = format(new Date(booking.startTime), 'MMM dd, yyyy');
  const formattedTime = format(new Date(booking.startTime), 'h:mm a');

  return (
    <Card
      hover={!!onClick}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          handleClick();
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      aria-label={`Booking with ${booking.tutorName} for ${booking.subject} on ${formattedDate}`}
    >
      <div className="flex-1 min-w-0">
        {/* Date and Time */}
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="w-4 h-4 text-neutral-500 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <time className="text-sm font-medium text-neutral-900">
            {formattedDate} at {formattedTime}
          </time>
        </div>

        {/* Teacher Name */}
        {booking.tutorName && (
          <div className="flex items-center gap-2 mb-1">
            <svg
              className="w-4 h-4 text-neutral-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span
              className="text-sm text-neutral-700 truncate"
              aria-label={`Tutor: ${booking.tutorName}`}
            >
              {booking.tutorName}
            </span>
          </div>
        )}

        {/* Subject */}
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-neutral-500 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <span
            className="text-sm text-neutral-700 truncate"
            aria-label={`Subject: ${booking.subject}`}
          >
            {booking.subject}
          </span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex-shrink-0">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}
          role="status"
          aria-label={`Booking status: ${statusInfo.label}`}
        >
          {statusInfo.label}
        </span>
      </div>
    </Card>
  );
};
