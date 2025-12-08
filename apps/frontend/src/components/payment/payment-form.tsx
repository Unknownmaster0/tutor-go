'use client';

import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

interface PaymentFormProps {
  bookingId: string;
  amount: number;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}

export default function PaymentForm({
  bookingId,
  amount,
  onSuccess,
  onError,
  onCancel,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message || 'Payment submission failed');
        setLoading(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/success?bookingId=${bookingId}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred');
      onError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Payment Details</h2>

        {/* Amount Display */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Total Amount:</span>
            <span className="text-2xl font-bold text-blue-600">
              ${amount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Stripe Payment Element */}
        <div className="mb-6">
          <PaymentElement />
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {errorMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!stripe || loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>🔒 Your payment information is secure and encrypted</p>
        </div>
      </div>
    </form>
  );
}
