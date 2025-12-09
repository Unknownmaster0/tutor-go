'use client';

import { useState } from 'react';

interface TimeSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface AvailabilityScheduleProps {
  schedule: TimeSlot[];
  onScheduleChange: (schedule: TimeSlot[]) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
const QUICK_PRESETS = [
  { name: 'Business Hours', slots: [9, 10, 11, 12, 13, 14, 15, 16, 17] },
  { name: 'Evening', slots: [17, 18, 19, 20, 21] },
  { name: 'Weekends Only', slots: [5, 6] },
  { name: 'Custom', slots: [] },
];

export const AvailabilitySchedule: React.FC<AvailabilityScheduleProps> = ({
  schedule,
  onScheduleChange,
}) => {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const handleDayToggle = (dayOfWeek: number) => {
    const daySchedules = schedule.filter((s) => s.dayOfWeek === dayOfWeek);
    const allAvailable = daySchedules.every((s) => s.isAvailable);

    const updated = schedule.map((s) =>
      s.dayOfWeek === dayOfWeek ? { ...s, isAvailable: !allAvailable } : s,
    );

    onScheduleChange(updated);
  };

  const handleTimeSlotToggle = (dayOfWeek: number, hour: number) => {
    const startTime = `${String(hour).padStart(2, '0')}:00`;
    const endTime = `${String(hour + 1).padStart(2, '0')}:00`;

    const updated = schedule.map((s) => {
      if (s.dayOfWeek === dayOfWeek && s.startTime === startTime) {
        return { ...s, isAvailable: !s.isAvailable };
      }
      return s;
    });

    onScheduleChange(updated);
  };

  const applyPreset = (preset: (typeof QUICK_PRESETS)[0]) => {
    if (preset.slots.length === 0) return;

    const updated = schedule.map((s) => {
      const isPresetDay = preset.slots.includes(s.dayOfWeek);
      const hour = parseInt(s.startTime.split(':')[0]);
      const isPresetHour = [9, 10, 11, 12, 13, 14, 15, 16, 17].includes(hour); // Default business hours

      return {
        ...s,
        isAvailable: isPresetDay && isPresetHour,
      };
    });

    onScheduleChange(updated);
  };

  const getDaySchedules = (dayOfWeek: number) => schedule.filter((s) => s.dayOfWeek === dayOfWeek);
  const isDayFull = (dayOfWeek: number) => getDaySchedules(dayOfWeek).every((s) => s.isAvailable);

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Availability Schedule</h3>

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2">
        {QUICK_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => applyPreset(preset)}
            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Days View */}
      <div className="space-y-2">
        {DAYS.map((day, dayOfWeek) => (
          <div key={day} className="border border-gray-200 rounded-lg">
            {/* Day Header */}
            <button
              type="button"
              onClick={() => setExpandedDay(expandedDay === dayOfWeek ? null : dayOfWeek)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isDayFull(dayOfWeek)}
                  onChange={() => handleDayToggle(dayOfWeek)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded cursor-pointer"
                />
                <span className="font-medium text-gray-900">{day}</span>
                <span className="text-sm text-gray-500">
                  ({getDaySchedules(dayOfWeek).filter((s) => s.isAvailable).length}/24 hours)
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition ${expandedDay === dayOfWeek ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </button>

            {/* Expanded Time Slots */}
            {expandedDay === dayOfWeek && (
              <div className="border-t border-gray-200 bg-gray-50 p-4 grid grid-cols-6 gap-2">
                {HOURS.map((hour) => {
                  const slot = getDaySchedules(dayOfWeek).find((s) => s.startTime === hour);
                  return (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => handleTimeSlotToggle(dayOfWeek, parseInt(hour))}
                      className={`p-2 rounded text-sm font-medium transition ${
                        slot?.isAvailable
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                      }`}
                    >
                      {hour}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-600">
        💡 Tip: Click on days to toggle all hours, or expand to select specific time slots
      </p>
    </div>
  );
};
