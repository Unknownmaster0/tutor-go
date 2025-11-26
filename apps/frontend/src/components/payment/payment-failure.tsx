'use client';

interface PaymentFailureProps {
  error: string;
  onRetry?: () => void;
  onCancel?: () => void;
}

export default function PaymentFailure({ error, onRetry, onCancel }: PaymentFailureProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h2>
        <p className="text-gray-600">We couldn't process your payment</p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-700 font-medium mb-1">Error Details:</p>
        <p className="text-red-600 text-sm">{error}</p>
      </div>

      <div className="space-y-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        )}
        {onCancel && (
          <button
            onClick={onCancel}
            className="w-full px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel Booking
          </button>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p>Need help? Contact our support team</p>
      </div>
    </div>
  );
}
