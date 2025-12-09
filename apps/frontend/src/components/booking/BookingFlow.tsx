'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AvailabilitySlots } from './AvailabilitySlots';
import { BookingDetails } from './BookingDetails';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface BookingFlowProps {
  tutorId: string;
  tutorName: string;
  tutorImage?: string;
  hourlyRate: number;
  subject: string;
}

interface BookingPayload {
  tutorId: string;
  timeSlotId: string;
  sessionDate: string;
  sessionTime: string;
  sessionDuration: number;
  totalAmount: number;
  notes?: string;
}

export const BookingFlow: React.FC<BookingFlowProps> = ({
  tutorId,
  tutorName,
  tutorImage,
  hourlyRate,
  subject,
}) => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [sessionDuration, setSessionDuration] = useState(60);
  const [sessionNotes, setSessionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPrice = ((sessionDuration / 60) * hourlyRate).toFixed(2);

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleDurationChange = (duration: number) => {
    setSessionDuration(duration);
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handleSubmitBooking = async () => {
    if (!selectedSlot) {
      toast.error('Time slot not selected');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: BookingPayload = {
        tutorId,
        timeSlotId: selectedSlot.id,
        sessionDate: selectedSlot.date,
        sessionTime: selectedSlot.startTime,
        sessionDuration,
        totalAmount: parseFloat(totalPrice),
        notes: sessionNotes || undefined,
      };

      const response = await apiClient.post<{ bookingId: string }>('/api/booking/create', payload);

      if (response) {
        const bookingId = response?.bookingId;
        toast.success('Booking created successfully!');
        // Redirect to booking confirmation page
        router.push(`/booking/confirmation/${bookingId}`);
      } else {
        toast.error('Failed to create booking');
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900">Schedule a Session</h1>
          <p className="text-gray-600 mt-1">Book a tutoring session with {tutorName}</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                  s <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`w-12 h-1 transition-colors ${
                    s < step ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="grid grid-cols-3 gap-4 mb-8 text-center">
          <div>
            <p className={`text-sm font-medium ${step >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>
              Select Time
            </p>
          </div>
          <div>
            <p className={`text-sm font-medium ${step >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>
              Confirm Details
            </p>
          </div>
          <div>
            <p className={`text-sm font-medium ${step >= 3 ? 'text-blue-600' : 'text-gray-500'}`}>
              Payment
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div>
                <AvailabilitySlots
                  tutorId={tutorId}
                  onSlotSelect={handleSlotSelect}
                  selectedSlot={selectedSlot}
                />
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-lg shadow p-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Session Details</h3>

                {/* Duration Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Session Duration
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[30, 60, 90, 120].map((duration) => (
                      <button
                        key={duration}
                        onClick={() => handleDurationChange(duration)}
                        className={`p-4 rounded-lg font-medium transition-colors text-center ${
                          sessionDuration === duration
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        {duration} <span className="text-xs block mt-1">min</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Most sessions are 60 minutes, but you can adjust based on your needs
                  </p>
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Session Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="Let your tutor know what you'd like to focus on, e.g., 'Help with algebra homework' or 'Prepare for the midterm exam'"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">{sessionNotes.length}/500 characters</p>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 font-medium">✓ Time slot reserved</p>
                  <p className="text-sm text-blue-800 mt-1">
                    This slot is held for 15 minutes while you complete your booking
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-lg shadow p-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>

                <div className="space-y-3">
                  {[
                    { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
                    { id: 'wallet', name: 'Digital Wallet (Apple/Google Pay)', icon: '📱' },
                    {
                      id: 'crypto',
                      name: 'Cryptocurrency (Coming Soon)',
                      icon: '₿',
                      disabled: true,
                    },
                  ].map((method) => (
                    <button
                      key={method.id}
                      disabled={method.disabled}
                      className={`w-full p-4 rounded-lg border-2 text-left font-medium transition-colors ${
                        method.disabled
                          ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed opacity-50'
                          : 'border-gray-300 text-gray-900 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      <span className="mr-3">{method.icon}</span>
                      {method.name}
                      {method.disabled && <span className="text-xs ml-2">(Coming Soon)</span>}
                    </button>
                  ))}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-amber-900 mb-2">📋 Payment Terms</p>
                  <p className="text-sm text-amber-800">
                    By confirming your booking, you agree to our refund policy. Cancellations made
                    24 hours before the session are fully refundable.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div>
            <BookingDetails
              tutorName={tutorName}
              tutorImage={tutorImage}
              subject={subject}
              sessionDuration={sessionDuration}
              hourlyRate={hourlyRate}
              selectedDate={selectedSlot?.date}
              selectedTime={selectedSlot ? `${selectedSlot.startTime}` : undefined}
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={handlePreviousStep}
            disabled={step === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              step === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          {step < 3 ? (
            <button
              onClick={handleNextStep}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmitBooking}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Confirm & Pay'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
