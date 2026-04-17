'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { BackButton } from '@/components/common/back-button';
import { Booking } from '@/types/booking.types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    const fetchBooking = async () => {
      try {
        if (!bookingId) {
          setError('Booking ID is required');
          setLoading(false);
          return;
        }

        const bookingData = await apiClient.get<Booking>(`/bookings/${bookingId}`);
        setBooking(bookingData);
      } catch (err: any) {
        console.error('Error fetching booking:', err);
        setError(err.response?.data?.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handlePayment = async () => {
    if (!booking || !window.Razorpay) {
      setError('Payment system not ready. Please try again.');
      return;
    }

    setProcessing(true);
    try {
      // Create Razorpay order on backend
      const orderResponse = await apiClient.post('/payments/create-order', {
        bookingId: booking.id,
        amount: booking.totalAmount,
        currency: 'INR',
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(booking.totalAmount * 100), // Amount in paise
        currency: 'INR',
        name: 'TutorGo',
        description: `Booking for ${booking.subject}`,
        order_id: orderResponse.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            const confirmResponse = await apiClient.post('/payments/confirm', {
              orderId: orderResponse.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              bookingId: booking.id,
            });

            // Redirect to success page
            router.push(`/booking/${booking.id}?status=success`);
          } catch (err: any) {
            setError(err.response?.data?.message || 'Payment verification failed');
            setProcessing(false);
          }
        },
        prefill: {
          name: booking.studentName || 'Student',
          email: 'student@example.com',
          contact: '9000000000',
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'Failed to process payment');
      setProcessing(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Unable to load payment details'}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
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

        {/* Payment Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment</h1>

          {/* Booking Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Tutor:</span>
                <span className="font-medium text-gray-900">{booking.tutorName}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Subject:</span>
                <span className="font-medium text-gray-900">{booking.subject}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium text-gray-900">{formatDate(booking.startTime)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium text-gray-900">
                  {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4 flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium text-gray-900">
                  {(new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) /
                    (1000 * 60 * 60)}{' '}
                  hour(s)
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-bold">
                <span className="text-gray-900">Total Amount:</span>
                <span className="text-blue-600">₹{booking.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">Payment Method</h3>
            <p className="text-sm text-blue-800">
              You will be redirected to Razorpay to complete your payment securely. We accept all major payment methods.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => router.back()}
              disabled={processing}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={processing}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {processing ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>🔒 Your payment information is secure and encrypted</p>
          </div>
        </div>
      </div>
    </div>
  );
}
