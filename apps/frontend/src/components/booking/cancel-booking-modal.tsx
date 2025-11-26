'use client';

import { useState } from 'react';

interface CancelBookingModalProps {
  bookingId: string;
  onConfirm: (bookingId: string, reason?: string) => Promise<void>;
  onClose: () => void;
}

export default function CancelBookingModal({
  bookingId,
  onConfirm,
  onClose,
}: CancelBookingModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      await onConfirm(bookingId, reason);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Cancel Booking</h2>

        <p className="text-gray-600 mb-4">
          Are you sure you want to cancel this booking? This action cannot be undone.
        </p>

        <div className="mb-4">
          <label htmlFor="cancel-reason" className="block text-sm font-medium text-gray-700 mb-2">
            Reason for cancellation (optional)
          </label>
          <textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Let us know why you're cancelling..."
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Keep Booking
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Cancelling...' : 'Cancel Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}
