'use client';

import { useState, useEffect, useCallback } from 'react';
import { ToastNotification } from './toast-notification';
import { Notification } from '@/types/notification.types';

interface ToastItem {
  id: string;
  notification: Notification;
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((notification: Notification) => {
    setToasts((prev) => [...prev, { id: notification.id, notification }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Expose addToast globally for use in other components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__addToast = addToast;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__addToast;
      }
    };
  }, [addToast]);

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-4" data-testid="toast-container">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ marginTop: `${index * 8}px` }}
        >
          <ToastNotification
            notification={toast.notification}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

// Helper function to show toast notifications
export const showToast = (notification: Notification) => {
  if (typeof window !== 'undefined' && (window as any).__addToast) {
    (window as any).__addToast(notification);
  }
};
