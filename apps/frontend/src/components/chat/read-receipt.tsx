'use client';

import { Check, CheckCheck } from 'lucide-react';

interface ReadReceiptProps {
  isRead: boolean;
  isDelivered?: boolean;
}

export const ReadReceipt = ({ isRead, isDelivered = true }: ReadReceiptProps) => {
  if (!isDelivered) {
    return null;
  }

  return (
    <div className="inline-flex">
      {isRead ? (
        <CheckCheck className="w-4 h-4 text-blue-500" />
      ) : (
        <Check className="w-4 h-4 text-gray-400" />
      )}
    </div>
  );
};
