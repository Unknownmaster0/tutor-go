'use client';

import { useState, useEffect } from 'react';
import { BookingFormData, TimeSlot } from '@/types/booking.types';
import { TutorProfile } from '@/types/tutor.types';

interface BookingFormProps {
  tutor: TutorProfile;
  onSubmit: (data: BookingFormData) => Promise<void>;
  onCancel?: () => void;
}

export default function BookingForm({ tutor, onSubmit, onCancel }: BookingFormProps) {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate total amount based on time slot duration
  const calculateAmount = (slot: TimeSlot | null): number => {
    if (!slot) return 0;
    const hours = (slot.endTime.getTime() - slot.startTime.getTime()) / (1000 * 60 * 60);
    return hours * tutor.hourlyRate;
  };

  const totalAmount = calculateAmount(selectedTimeSlot);

  // Generate mock time slots for the selected date
  useEffect(() => {
    if (selectedDate) {
      // In a real app, this would fetch from the API
      const slots: TimeSlot[] = [];
      const date = new Date(selectedDate);
      
      // Generate slots from 9 AM to 5 PM
      for (let hour = 9; hour < 17; hour++) {
        const startTime = new Date(date);
        startTime.setHours(hour, 0, 0, 0);
        
        const endTime = new Date(date);
        endTime.setHours(hour + 1, 0, 0, 0);
        
        slots.push({
          startTime,
          endTime,
          available: Math.random() > 0.3, // Mock availability
        });
      }
      
      setAvailableSlots(slots);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedSubject) {
      setError('Please select a subject');
      return;
    }

    if (!selectedTimeSlot) {
      setError('Please select a time slot');
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        tutorId: tutor.id,
        subject: selectedSubject,
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (!selectedSubject) {
      setError('Please select a subject');
      return;
    }

    if (!selectedTimeSlot) {
      setError('Please select a time slot');
      return;
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get minimum date (today)
  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Book a Session</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tutor Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">{tutor.name}</h3>
          <p className="text-gray-600">${tutor.hourlyRate}/hour</p>
        </div>

        {/* Subject Selection */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            Select Subject
          </label>
          <select
            id="subject"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Choose a subject...</option>
            {tutor.subjects.map((subject) => (
              <option key={subject.name} value={subject.name}>
                {subject.name} ({subject.proficiency})
              </option>
            ))}
          </select>
        </div>

        {/* Date Selection */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedTimeSlot(null);
            }}
            min={minDate}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Time Slot Selection */}
        {selectedDate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Time Slot
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {availableSlots.map((slot, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => slot.available && setSelectedTimeSlot(slot)}
                  disabled={!slot.available}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    selectedTimeSlot === slot
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : slot.available
                      ? 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                      : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  {!slot.available && <span className="block text-xs">Unavailable</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Booking Summary */}
        {selectedTimeSlot && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-lg mb-3">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tutor:</span>
                <span className="font-medium">{tutor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subject:</span>
                <span className="font-medium">{selectedSubject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{formatDate(selectedTimeSlot.startTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">
                  {formatTime(selectedTimeSlot.startTime)} - {formatTime(selectedTimeSlot.endTime)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-blue-300">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">
                  {(selectedTimeSlot.endTime.getTime() - selectedTimeSlot.startTime.getTime()) / (1000 * 60 * 60)} hour(s)
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-blue-300">
                <span>Total:</span>
                <span className="text-blue-600">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            onClick={handleButtonClick}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </div>
      </form>
    </div>
  );
}
