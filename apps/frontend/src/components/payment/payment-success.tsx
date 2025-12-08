'use client';

import { useRouter } from 'next/navigation';

interface PaymentSuccessProps {
  bookingId: string;
  paymentId: string;
  amount: number;
}

export default function PaymentSuccess({ bookingId, paymentId, amount }: PaymentSuccessProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600">Your booking has been confirmed</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Booking ID:</span>
            <span className="font-medium">{bookingId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment ID:</span>
            <span className="font-medium">{paymentId}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-gray-300">
            <span className="text-gray-600">Amount Paid:</span>
            <span className="text-lg font-bold text-green-600">${amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => router.push(`/booking/${bookingId}`)}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          View Booking Details
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
