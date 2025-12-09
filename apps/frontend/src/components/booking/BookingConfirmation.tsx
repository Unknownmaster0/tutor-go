'use client';

import { useState } from 'react';
import { CheckCircle, Copy, Calendar, Clock, Users, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ReviewSubmission } from '../review/ReviewSubmission';

interface BookingConfirmationProps {
  bookingId: string;
  confirmationCode: string;
  tutorName: string;
  subject: string;
  tutorId?: string;
  sessionDate: string;
  sessionTime: string;
  sessionDuration: number;
  totalAmount: number;
  status: 'confirmed' | 'pending' | 'completed';
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  bookingId,
  confirmationCode,
  tutorName,
  subject,
  tutorId,
  sessionDate,
  sessionTime,
  sessionDuration,
  totalAmount,
  status,
}) => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(confirmationCode);
    setCopied(true);
    toast.success('Confirmation code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReceipt = () => {
    // TODO: Implement receipt download
    toast.success('Receipt will be emailed to you shortly');
  };

  const handleScheduleNextSession = () => {
    router.push('/search');
  };

  const handleViewBookings = () => {
    router.push('/dashboard/student/bookings');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const statusConfig = {
    confirmed: {
      color: 'green',
      icon: '✓',
      text: 'Confirmed',
      bgColor: 'bg-green-50',
      textColor: 'text-green-900',
      borderColor: 'border-green-300',
    },
    pending: {
      color: 'blue',
      icon: '⏳',
      text: 'Pending',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-900',
      borderColor: 'border-blue-300',
    },
    completed: {
      color: 'purple',
      icon: '✓✓',
      text: 'Completed',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-900',
      borderColor: 'border-purple-300',
    },
  };

  const config = statusConfig[status];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600">Your session has been successfully scheduled</p>
      </div>

      {/* Confirmation Code Card */}
      <div className={`${config.bgColor} border-2 ${config.borderColor} rounded-lg p-6 mb-6`}>
        <p className={`text-sm font-medium ${config.textColor} mb-2`}>
          {config.icon} Booking Status: {config.text}
        </p>
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-600 mb-2">
              Confirmation Code
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white rounded p-3 font-mono font-bold text-lg text-gray-900 border border-gray-200">
                {confirmationCode}
              </code>
              <button
                onClick={handleCopyCode}
                className="p-3 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-600 mb-1">Booking ID</p>
            <p className="font-mono text-sm text-gray-700">{bookingId}</p>
          </div>
        </div>
      </div>

      {/* Session Details Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Tutor Info */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Tutor</h3>
          </div>
          <p className="text-lg font-bold text-gray-900">{tutorName}</p>
          <p className="text-sm text-gray-600 mt-1">Subject: {subject}</p>
        </div>

        {/* Date & Time */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Session Date</h3>
          </div>
          <p className="text-lg font-bold text-gray-900">{formatDate(sessionDate)}</p>
          <div className="flex items-center gap-2 mt-3 text-blue-600">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{sessionTime}</span>
          </div>
        </div>

        {/* Duration */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Duration</h3>
          </div>
          <p className="text-lg font-bold text-gray-900">{sessionDuration} minutes</p>
          <p className="text-sm text-gray-600 mt-1">(≈ {(sessionDuration / 60).toFixed(1)} hour)</p>
        </div>

        {/* Total Amount */}
        <div className="bg-white rounded-lg shadow p-4 border border-green-200 bg-green-50">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Total Amount</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">${totalAmount.toFixed(2)}</p>
          <p className="text-sm text-gray-600 mt-1">Payment processed</p>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">What Happens Next?</h3>
        <ol className="space-y-3">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              1
            </span>
            <div>
              <p className="font-medium text-gray-900">Confirmation Email</p>
              <p className="text-sm text-gray-600">
                You'll receive a confirmation email shortly with all session details
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              2
            </span>
            <div>
              <p className="font-medium text-gray-900">Tutor Acceptance</p>
              <p className="text-sm text-gray-600">
                Your tutor will review and confirm the booking within 24 hours
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              3
            </span>
            <div>
              <p className="font-medium text-gray-900">Pre-Session Reminder</p>
              <p className="text-sm text-gray-600">
                You'll get a reminder 1 hour before your session
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              4
            </span>
            <div>
              <p className="font-medium text-gray-900">Join Session</p>
              <p className="text-sm text-gray-600">
                Click the session link to join the video call at the scheduled time
              </p>
            </div>
          </li>
        </ol>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {!reviewSubmitted && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Leave a Review
          </button>
        )}
        <button
          onClick={handleViewBookings}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          View All Bookings
        </button>
        <button
          onClick={handleScheduleNextSession}
          className="flex-1 px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
        >
          Schedule Another Session
        </button>
        <button
          onClick={handleDownloadReceipt}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Download Receipt
        </button>
      </div>

      {/* Review Modal */}
      {showReviewForm && tutorId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowReviewForm(false)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
            <div className="p-6">
              <ReviewSubmission
                bookingId={bookingId}
                tutorId={tutorId}
                tutorName={tutorName}
                onReviewSubmitted={() => {
                  setShowReviewForm(false);
                  setReviewSubmitted(true);
                  toast.success('Thank you for your review!');
                }}
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer Message */}
      <div className="mt-8 text-center text-sm text-gray-600">
        <p>
          Need help?{' '}
          <a href="/support" className="text-blue-600 hover:underline">
            Contact our support team
          </a>
        </p>
      </div>
    </div>
  );
};
