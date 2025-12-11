'use client';

interface AvailabilitySlot {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // "09:00"
  endTime: string; // "17:00"
}

interface AvailabilityCalendarProps {
  availability: AvailabilitySlot[];
  onSlotSelect?: (date: Date, slot: AvailabilitySlot) => void;
  className?: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function AvailabilityCalendar({
  availability,
  onSlotSelect,
  className = '',
}: AvailabilityCalendarProps) {
  // Get current week dates
  const getWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const dates: Date[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - currentDay + i);
      dates.push(date);
    }

    return dates;
  };

  const weekDates = getWeekDates();

  // Get availability for a specific day
  const getAvailabilityForDay = (dayOfWeek: number) => {
    return availability.filter((slot) => slot.dayOfWeek === dayOfWeek);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Availability</h3>
        <p className="text-sm text-gray-600 mt-1">Select a time slot to book a session</p>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDates.map((date, index) => {
            const daySlots = getAvailabilityForDay(date.getDay());
            const hasAvailability = daySlots.length > 0;
            const past = isPast(date);

            return (
              <div
                key={index}
                className={`text-center p-2 rounded-lg border ${
                  isToday(date)
                    ? 'border-blue-500 bg-blue-50'
                    : past
                      ? 'border-gray-200 bg-gray-50 opacity-50'
                      : hasAvailability
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="text-xs font-medium text-gray-600">
                  {DAYS[date.getDay()].slice(0, 3)}
                </div>
                <div
                  className={`text-lg font-semibold ${
                    isToday(date) ? 'text-blue-600' : 'text-gray-900'
                  }`}
                >
                  {date.getDate()}
                </div>
                {hasAvailability && !past && (
                  <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Time Slots */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Available Time Slots</h4>

          {DAYS.map((day, dayIndex) => {
            const daySlots = getAvailabilityForDay(dayIndex);

            if (daySlots.length === 0) return null;

            return (
              <div key={dayIndex} className="mb-3">
                <div className="text-sm font-medium text-gray-600 mb-2">{day}</div>
                <div className="flex flex-wrap gap-2">
                  {daySlots.map((slot, slotIndex) => (
                    <button
                      key={slotIndex}
                      onClick={() => {
                        const date = weekDates[dayIndex];
                        if (onSlotSelect && !isPast(date)) {
                          onSlotSelect(date, slot);
                        }
                      }}
                      disabled={isPast(weekDates[dayIndex])}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300"
                    >
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {availability.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <svg
                className="w-12 h-12 mx-auto mb-2 text-gray-400"
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
              <p>No availability set yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
