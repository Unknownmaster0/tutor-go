'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';

export const ForgotPasswordForm: React.FC = () => {
  const { forgotPassword, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const validateEmail = (): boolean => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Invalid email format');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateEmail()) {
      return;
    }

    try {
      await forgotPassword(email);
      setSubmitted(true);
      toast.success('Password reset email sent!');
    } catch (err) {
      toast.error(error || 'Failed to send reset email');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) {
      setEmailError('');
    }
  };

  if (submitted) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          <p className="font-medium">Check your email</p>
          <p className="text-sm mt-2">
            We've sent a password reset link to <strong>{email}</strong>. Click the link to reset
            your password.
          </p>
        </div>
        <p className="text-sm text-gray-600">
          Didn't receive the email?{' '}
          <button
            onClick={() => setSubmitted(false)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Try again
          </button>
        </p>
        <Link
          href="/auth/login"
          className="inline-block text-blue-600 hover:text-blue-700 font-medium"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Reset Your Password</h2>
      <p className="text-gray-600">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={handleChange}
          className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            emailError ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="you@example.com"
        />
        {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isLoading ? 'Sending...' : 'Send Reset Link'}
      </button>

      <p className="text-center text-sm text-gray-600">
        <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
          Back to login
        </Link>
      </p>
    </form>
  );
};
