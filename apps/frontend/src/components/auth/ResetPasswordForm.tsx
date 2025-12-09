'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';

export const ResetPasswordForm: React.FC = () => {
  const { resetPassword, isLoading, error, clearError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="font-medium">Invalid Reset Link</p>
          <p className="text-sm mt-2">
            The password reset link is missing or invalid. Please request a new one.
          </p>
        </div>
        <Link
          href="/auth/forgot-password"
          className="inline-block text-blue-600 hover:text-blue-700 font-medium"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      await resetPassword(token, formData.password);
      setSubmitted(true);
      toast.success('Password reset successful!');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err) {
      toast.error(error || 'Failed to reset password');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  if (submitted) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          <p className="font-medium">Password Reset Successful</p>
          <p className="text-sm mt-2">
            Your password has been reset. You will be redirected to the login page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
      <p className="text-gray-600">Enter your new password below.</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          New Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            validationErrors.password ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="••••••••"
        />
        {validationErrors.password && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="••••••••"
        />
        {validationErrors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isLoading ? 'Resetting...' : 'Reset Password'}
      </button>

      <p className="text-center text-sm text-gray-600">
        <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
          Back to login
        </Link>
      </p>
    </form>
  );
};
