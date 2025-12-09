'use client';

import { MoreVertical, Flag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { RatingStars } from './RatingStars';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api-client';

interface ReviewCardProps {
  id: string;
  studentName: string;
  studentImage?: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  isOwner?: boolean;
  canDelete?: boolean;
  onReviewDeleted?: () => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  id,
  studentName,
  studentImage,
  rating,
  reviewText,
  createdAt,
  isOwner = false,
  canDelete = false,
  onReviewDeleted,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await apiClient.delete(`/reviews/${id}`);

      if (response) {
        toast.success('Review deleted successfully');
        onReviewDeleted?.();
      } else {
        toast.error('Failed to delete review');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reportReason.trim()) {
      toast.error('Please select a reason for reporting');
      return;
    }

    try {
      const response = await apiClient.patch(`/reviews/${id}/flag`, {
        reason: reportReason,
      });

      if (response) {
        toast.success('Thank you for reporting. We will review this soon.');
        setShowReportForm(false);
        setReportReason('');
        setShowMenu(false);
      } else {
        toast.error('Failed to report review');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to report review');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Avatar */}
          {studentImage ? (
            <img
              src={studentImage}
              alt={studentName}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {studentName.charAt(0)}
            </div>
          )}

          {/* Name & Date */}
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">{studentName}</p>
            <p className="text-xs text-gray-500">{formatDate(createdAt)}</p>
          </div>
        </div>

        {/* Menu Button */}
        {(isOwner || canDelete) && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-gray-700"
              aria-label="Review options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {isOwner && (
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 transition-colors flex items-center gap-2 text-sm font-medium border-b border-gray-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeleting ? 'Deleting...' : 'Delete Review'}
                  </button>
                )}
                {!isOwner && (
                  <button
                    onClick={() => setShowReportForm(true)}
                    className="w-full text-left px-4 py-2 hover:bg-amber-50 text-amber-600 transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <Flag className="w-4 h-4" />
                    Report Review
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="mb-3">
        <RatingStars rating={rating} interactive={false} size="sm" />
      </div>

      {/* Review Text */}
      <p className="text-gray-700 text-sm leading-relaxed">{reviewText}</p>

      {/* Report Form */}
      {showReportForm && !isOwner && (
        <div className="mt-4 pt-4 border-t border-gray-200 bg-amber-50 rounded p-3">
          <form onSubmit={handleReport} className="space-y-3">
            <p className="text-sm font-medium text-gray-900">Why are you reporting this review?</p>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a reason...</option>
              <option value="inappropriate">Inappropriate content</option>
              <option value="spam">Spam or fake review</option>
              <option value="offensive">Offensive language</option>
              <option value="harassment">Harassment or bullying</option>
              <option value="other">Other</option>
            </select>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowReportForm(false)}
                className="flex-1 px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-3 py-1 text-sm bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
              >
                Report
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
