'use client';

import { useState } from 'react';
import { TutorProfile } from '@/types/tutor.types';
import { apiClient } from '@/lib/api-client';

interface AvailabilitySlot {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // "09:00"
  endTime: string; // "17:00"
}

interface AvailabilityManagerProps {
  profile: TutorProfile;
  onUpdate: () => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function AvailabilityManager({ profile, onUpdate }: AvailabilityManagerProps) {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(
    (profile as any).availability || [],
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [bookedSlots, setBookedSlots] = useState<AvailabilitySlot[]>([]);
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:00',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAddSlot = () => {
    // Validate times
    if (newSlot.startTime >= newSlot.endTime) {
      setMessage({ type: 'error', text: 'End time must be after start time' });
      return;
    }

    // Check for overlapping slots
    const overlapping = availability.some(
      (slot) =>
        slot.dayOfWeek === newSlot.dayOfWeek &&
        ((newSlot.startTime >= slot.startTime && newSlot.startTime < slot.endTime) ||
          (newSlot.endTime > slot.startTime && newSlot.endTime <= slot.endTime) ||
          (newSlot.startTime <= slot.startTime && newSlot.endTime >= slot.endTime)),
    );

    if (overlapping) {
      setMessage({ type: 'error', text: 'This time slot overlaps with an existing slot' });
      return;
    }

    setAvailability([...availability, { ...newSlot }]);
    setMessage(null);
  };

  const handleRemoveSlot = (index: number) => {
    const slotToRemove = availability[index];

    // Check if slot is booked
    const isBooked = bookedSlots.some(
      (booked) =>
        booked.dayOfWeek === slotToRemove.dayOfWeek &&
        booked.startTime === slotToRemove.startTime &&
        booked.endTime === slotToRemove.endTime,
    );

    if (isBooked) {
      setMessage({
        type: 'error',
        text: 'Cannot delete a time slot with existing bookings',
      });
      return;
    }

    setAvailability(availability.filter((_, i) => i !== index));
    setMessage(null);
  };

  const handleSave = async () => {
    if (availability.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one availability slot' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await apiClient.put('/tutors/availability', { availability });
      setMessage({ type: 'success', text: 'Availability updated successfully!' });
      onUpdate();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update availability',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isSlotBooked = (slot: AvailabilitySlot) => {
    return bookedSlots.some(
      (booked) =>
        booked.dayOfWeek === slot.dayOfWeek &&
        booked.startTime === slot.startTime &&
        booked.endTime === slot.endTime,
    );
  };

  // Group availability by day
  const groupedAvailability = DAYS.map((day, dayIndex) => ({
    day,
    dayIndex,
    slots: availability.filter((slot) => slot.dayOfWeek === dayIndex),
  }));

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Manage Your Availability</h2>
        <p className="text-sm text-gray-600 mt-1">
          Set your available time slots for students to book sessions
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Add New Slot */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Time Slot</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-1">
                Day
              </label>
              <select
                id="day"
                value={newSlot.dayOfWeek}
                onChange={(e) => setNewSlot({ ...newSlot, dayOfWeek: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {DAYS.map((day, index) => (
                  <option key={index} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                id="startTime"
                value={newSlot.startTime}
                onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                id="endTime"
                value={newSlot.endTime}
                onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddSlot}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Slot
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Current Availability */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Availability</h3>

          {availability.length > 0 ? (
            <div className="space-y-4">
              {groupedAvailability.map(
                ({ day, dayIndex, slots }) =>
                  slots.length > 0 && (
                    <div key={dayIndex} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">{day}</h4>
                      <div className="space-y-2">
                        {slots.map((slot, slotIndex) => {
                          const globalIndex = availability.findIndex(
                            (s) =>
                              s.dayOfWeek === slot.dayOfWeek &&
                              s.startTime === slot.startTime &&
                              s.endTime === slot.endTime,
                          );
                          const booked = isSlotBooked(slot);

                          return (
                            <div
                              key={slotIndex}
                              className={`flex items-center justify-between p-3 rounded-lg ${
                                booked ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center">
                                <span className="text-gray-900">
                                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                </span>
                                {booked && (
                                  <span className="ml-3 px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded">
                                    Booked
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => handleRemoveSlot(globalIndex)}
                                disabled={booked}
                                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Remove
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ),
              )}
            </div>
          ) : (
            <div className="text-center py-12 border border-gray-200 rounded-lg">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-500">No availability slots set yet</p>
              <p className="text-sm text-gray-400 mt-1">Add your first time slot above</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
