'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BookingConfirmation } from '@/components/booking/BookingConfirmation';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api-client';

interface BookingDetails {
  id: string;
  confirmationCode: string;
  tutorName: string;
  subject: string;
  sessionDate: string;
  sessionTime: string;
  sessionDuration: number;
  totalAmount: number;
  status: 'confirmed' | 'pending' | 'completed';
}

export default function BookingConfirmationPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;

  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.get<BookingDetails>(`bookings/${bookingId}`);

        if (response) {
          setBookingDetails(response);
        } else {
          setError('Failed to load booking details');
        }
      } catch (err: any) {
        console.error('Error fetching booking details:', err);
        setError(err.response?.data?.message || 'Failed to load booking details');
      } finally {
        setIsLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white rounded-lg shadow p-8 max-w-md">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load</h2>
          <p className="text-gray-600 mb-6">{error || 'Booking details not found'}</p>
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <BookingConfirmation
          bookingId={bookingDetails.id}
          confirmationCode={bookingDetails.confirmationCode}
          tutorName={bookingDetails.tutorName}
          subject={bookingDetails.subject}
          sessionDate={bookingDetails.sessionDate}
          sessionTime={bookingDetails.sessionTime}
          sessionDuration={bookingDetails.sessionDuration}
          totalAmount={bookingDetails.totalAmount}
          status={bookingDetails.status}
        />
      </div>
    </div>
  );
}
