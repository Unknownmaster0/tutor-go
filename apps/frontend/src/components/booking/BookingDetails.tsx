'use client';

import { ReactNode } from 'react';
import { Clock, Users, DollarSign, AlertCircle } from 'lucide-react';

interface BookingDetailsProps {
  tutorName: string;
  tutorImage?: string;
  subject: string;
  sessionDuration: number; // in minutes (typically 60, 90, 120)
  hourlyRate: number;
  selectedDate?: string;
  selectedTime?: string;
  children?: ReactNode;
}

export const BookingDetails: React.FC<BookingDetailsProps> = ({
  tutorName,
  tutorImage,
  subject,
  sessionDuration,
  hourlyRate,
  selectedDate,
  selectedTime,
  children,
}) => {
  const calculateTotalPrice = () => {
    return ((sessionDuration / 60) * hourlyRate).toFixed(2);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'TBD';
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const totalPrice = calculateTotalPrice();

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Booking Summary</h3>

      {/* Tutor Info */}
      <div className="border-b pb-6">
        <div className="flex items-start gap-4">
          {tutorImage ? (
            <img src={tutorImage} alt={tutorName} className="w-16 h-16 rounded-lg object-cover" />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
              {tutorName.charAt(0)}
            </div>
          )}
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900">{tutorName}</h4>
            <p className="text-sm text-gray-600">Tutor</p>
            <p className="text-blue-600 font-medium mt-1">${hourlyRate}/hr</p>
          </div>
        </div>
      </div>

      {/* Subject */}
      <div className="border-b pb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">Subject</p>
        <p className="text-gray-900 font-semibold">{subject}</p>
      </div>

      {/* Session Details */}
      <div className="space-y-4">
        {/* Duration */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">Session Duration</p>
            <p className="font-medium text-gray-900">{sessionDuration} minutes</p>
          </div>
        </div>

        {/* Date & Time */}
        {selectedDate && selectedTime && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Scheduled For</p>
              <p className="font-medium text-gray-900">
                {formatDate(selectedDate)} at {selectedTime}
              </p>
            </div>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">Price</p>
            <div className="flex items-baseline gap-2">
              <p className="font-medium text-gray-900">${totalPrice}</p>
              <p className="text-xs text-gray-500">
                ({sessionDuration / 60}h × ${hourlyRate}/hr)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Price Summary Card */}
      <div className="bg-blue-50 rounded-lg p-4 space-y-2 border border-blue-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Subtotal</span>
          <span className="font-medium text-gray-900">${totalPrice}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Tax (estimated)</span>
          <span className="font-medium text-gray-900">$0.00</span>
        </div>
        <div className="border-t border-blue-300 pt-2 flex items-center justify-between">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="text-lg font-bold text-blue-600">${totalPrice}</span>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-900 mb-1">Payment Method</p>
          <p className="text-sm text-amber-800">
            You'll be able to choose your payment method (Credit Card, Debit Card, or Digital
            Wallet) on the next step.
          </p>
        </div>
      </div>

      {/* Children (Additional Components) */}
      {children}
    </div>
  );
};
