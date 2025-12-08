'use client';

import { useEffect, useState } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from './payment-form';
import { apiClient } from '@/lib/api-client';
import { PaymentIntent } from '@/types/payment.types';

interface StripePaymentWrapperProps {
  bookingId: string;
  amount: number;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}

export default function StripePaymentWrapper({
  bookingId,
  amount,
  onSuccess,
  onError,
  onCancel,
}: StripePaymentWrapperProps) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load Stripe
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (publishableKey) {
      setStripePromise(loadStripe(publishableKey));
    } else {
      setError('Stripe configuration is missing');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Create payment intent
    const createPaymentIntent = async () => {
      try {
        const data = await apiClient.post<PaymentIntent>('/payments/create-intent', {
          bookingId,
          amount,
          currency: 'usd',
        });

        setClientSecret(data.clientSecret);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to initialize payment');
        setLoading(false);
        onError(err.response?.data?.message || 'Failed to initialize payment');
      }
    };

    if (bookingId && amount) {
      createPaymentIntent();
    }
  }, [bookingId, amount, onError]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Initializing payment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold mb-2">Payment Initialization Failed</p>
          <p>{error}</p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="mt-4 w-full px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
        )}
      </div>
    );
  }

  if (!stripePromise || !clientSecret) {
    return null;
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2563eb',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm
        bookingId={bookingId}
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
        onCancel={onCancel}
      />
    </Elements>
  );
}
