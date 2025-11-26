'use client';

import { useEffect, useState } from 'react';
import { Notification, NotificationType } from '@/types/notification.types';

interface ToastNotificationProps {
  notification: Notification;
  onClose: () => void;
  duration?: number;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  notification,
  onClose,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  const getToastColor = (type: NotificationType) => {
    switch (type) {
      case 'booking':
        return 'bg-blue-500';
      case 'payment':
        return 'bg-green-500';
      case 'message':
        return 'bg-purple-500';
      case 'review':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'booking':
        return '📅';
      case 'payment':
        return '💳';
      case 'message':
        return '💬';
      case 'review':
        return '⭐';
      default:
        return '🔔';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      }`}
      data-testid="toast-notification"
      role="alert"
    >
      <div className="flex items-start p-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getToastColor(notification.type)} flex items-center justify-center text-white text-xl`}>
          {getIcon(notification.type)}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900" data-testid="toast-title">
            {notification.title}
          </p>
          <p className="mt-1 text-sm text-gray-600" data-testid="toast-message">
            {notification.message}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none"
          data-testid="toast-close-button"
          aria-label="Close notification"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className={`h-1 ${getToastColor(notification.type)} relative overflow-hidden`}>
        <div
          className="h-full bg-white bg-opacity-30 absolute top-0 left-0"
          style={{
            animation: `toast-shrink ${duration}ms linear`,
            animationFillMode: 'forwards',
          }}
        />
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes toast-shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `
      }} />
    </div>
  );
};
