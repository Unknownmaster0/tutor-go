'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { FlaggedContent, ModerationAction } from '@/types/admin.types';
import { ModerationFilters } from '@/components/admin/moderation-filters';
import { FlaggedContentList } from '@/components/admin/flagged-content-list';

export default function ContentModeration() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState<FlaggedContent[]>([]);
  const [filteredContent, setFilteredContent] = useState<FlaggedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ type?: string; status?: string }>({});

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchFlaggedContent = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.get<FlaggedContent[]>('/admin/flagged-content');
        setContent(data);
        setFilteredContent(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load flagged content');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchFlaggedContent();
    }
  }, [user]);

  useEffect(() => {
    let result = [...content];

    // Apply type filter
    if (filters.type) {
      result = result.filter((item) => item.type === filters.type);
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter((item) => item.status === filters.status);
    }

    setFilteredContent(result);
  }, [filters, content]);

  const handleFilterChange = (newFilters: { type?: string; status?: string }) => {
    setFilters(newFilters);
  };

  const handleModerate = async (contentId: string, action: ModerationAction) => {
    try {
      await apiClient.post(`/admin/flagged-content/${contentId}/moderate`, action);

      // Update local state
      setContent((prev) =>
        prev.map((item) =>
          item.id === contentId
            ? { ...item, status: action.action === 'approve' ? 'approved' : 'removed' }
            : item,
        ),
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to moderate content');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading flagged content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="content-moderation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
          <p className="mt-2 text-gray-600">Review and moderate flagged content</p>
        </div>

        <ModerationFilters onFilterChange={handleFilterChange} />

        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredContent.length} of {content.length} items
        </div>

        <FlaggedContentList content={filteredContent} onModerate={handleModerate} />
      </div>
    </div>
  );
}
