'use client';

interface UserStatusProps {
  isOnline: boolean;
  lastSeen?: Date;
  showText?: boolean;
}

export const UserStatus = ({
  isOnline,
  lastSeen,
  showText = true,
}: UserStatusProps) => {
  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const lastSeenDate = new Date(date);
    const diffInMinutes = Math.floor(
      (now.getTime() - lastSeenDate.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <div
          className={`w-3 h-3 rounded-full ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
        {isOnline && (
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />
        )}
      </div>
      {showText && (
        <span className="text-sm text-gray-600">
          {isOnline ? 'Online' : lastSeen ? formatLastSeen(lastSeen) : 'Offline'}
        </span>
      )}
    </div>
  );
};
