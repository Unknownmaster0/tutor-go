'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api-client';

interface TimeSlot {
  id: string;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
}

interface AvailabilitySlotsProps {
  tutorId: string;
  onSlotSelect: (slot: TimeSlot) => void;
  selectedSlot?: TimeSlot | null;
}

export const AvailabilitySlots: React.FC<AvailabilitySlotsProps> = ({
  tutorId,
  onSlotSelect,
  selectedSlot,
}) => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  useEffect(() => {
    const fetchAvailabilitySlots = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get<TimeSlot[]>(`/api/tutor/${tutorId}/availability`);
        const availableSlots = response || [];

        // Sort slots by date and time
        const sorted = availableSlots.sort(
          (a: TimeSlot, b: TimeSlot) =>
            new Date(`${a.date}T${a.startTime}`).getTime() -
            new Date(`${b.date}T${b.startTime}`).getTime(),
        );

        setSlots(sorted);

        // Set first available date as default
        if (sorted.length > 0) {
          setSelectedDate(sorted[0].date);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to load availability slots');
        setSlots([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailabilitySlots();
  }, [tutorId]);

  const getUniqueDates = () => {
    const uniqueDates = [...new Set(slots.map((slot) => slot.date))];
    return uniqueDates.sort();
  };

  const getSlotsByDate = (date: string) => {
    return slots.filter((slot) => slot.date === date && slot.isAvailable);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const isToday = (dateStr: string) => {
    const today = new Date();
    const date = new Date(`${dateStr}T00:00:00`);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isTomorrow = (dateStr: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const date = new Date(`${dateStr}T00:00:00`);
    return (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-center text-gray-600 text-sm">Loading available slots...</p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Available Slots</h3>
        <p className="text-gray-600">
          This tutor doesn't have any available time slots at the moment. Check back later!
        </p>
      </div>
    );
  }

  const uniqueDates = getUniqueDates();
  const currentDateSlots = getSlotsByDate(selectedDate);

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Select a Time Slot</h3>
        <div className="flex gap-2">
          {['calendar', 'list'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as 'calendar' | 'list')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mode === 'calendar' ? '📅' : '📋'} {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <>
          {/* Date Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Select Date</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {uniqueDates.map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`p-3 rounded-lg text-center text-sm font-medium transition-colors ${
                    selectedDate === date
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-xs font-semibold">
                    {isToday(date) ? 'Today' : isTomorrow(date) ? 'Tomorrow' : formatDate(date)}
                  </div>
                  <div className="text-xs mt-1 opacity-75">{getDayName(date).slice(0, 3)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots for Selected Date */}
          {currentDateSlots.length > 0 ? (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Select Time</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {currentDateSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => onSlotSelect(slot)}
                    className={`p-3 rounded-lg text-center font-medium transition-colors ${
                      selectedSlot?.id === slot.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-50 text-gray-900 border border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    <Clock className="w-4 h-4 mx-auto mb-1" />
                    <div className="text-sm">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">
                No slots available on {formatDate(selectedDate)}. Please select another date.
              </p>
            </div>
          )}
        </>
      ) : (
        // List View
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {slots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => onSlotSelect(slot)}
              className={`w-full p-3 rounded-lg text-left transition-colors border-2 ${
                selectedSlot?.id === slot.id
                  ? 'bg-blue-50 border-blue-600'
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {isToday(slot.date)
                      ? 'Today'
                      : isTomorrow(slot.date)
                        ? 'Tomorrow'
                        : formatDate(slot.date)}
                    {' • '}
                    {getDayName(slot.date)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                    Available
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Selected Slot Summary */}
      {selectedSlot && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-4">
          <p className="text-sm font-medium text-green-900 mb-1">✓ Time Slot Selected</p>
          <p className="text-green-700">
            {isToday(selectedSlot.date)
              ? 'Today'
              : isTomorrow(selectedSlot.date)
                ? 'Tomorrow'
                : formatDate(selectedSlot.date)}{' '}
            at {formatTime(selectedSlot.startTime)}
          </p>
        </div>
      )}
    </div>
  );
};
