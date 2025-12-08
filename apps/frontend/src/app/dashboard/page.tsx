'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useTeachers } from '@/hooks/use-teachers';
import { useBookings } from '@/hooks/use-bookings';
import { useConversations } from '@/hooks/use-conversations';
import { TeacherList, BookingHistoryCard, ChatHistoryCard } from '@/components/dashboard';
import { Button } from '@/components/ui/Button';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; section: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; section: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in ${this.props.section}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-error/10 border border-error/20 rounded-lg p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-error mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Something went wrong</h3>
          <p className="text-sm text-neutral-600 mb-4">
            We encountered an error loading this section.
          </p>
          <Button
            variant="secondary"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Section Error Display Component
function SectionError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-error/10 border border-error/20 rounded-lg p-6 text-center">
      <svg
        className="mx-auto h-10 w-10 text-error mb-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p className="text-sm text-neutral-700 mb-3">{message}</p>
      <Button variant="secondary" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();
  const {
    teachers,
    isLoading: teachersLoading,
    error: teachersError,
    refetch: refetchTeachers,
  } = useTeachers();
  const {
    bookings,
    isLoading: bookingsLoading,
    error: bookingsError,
    refetch: refetchBookings,
  } = useBookings(user?.id || '', { status: 'completed' });
  const {
    conversations,
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations,
  } = useConversations(user?.id || '');

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Skip to content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-primary-600 focus:text-white"
      >
        Skip to main content
      </a>

      {/* Header */}
      <nav
        className="bg-white shadow-soft sticky top-0 z-10"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary-600">TutorGo</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-neutral-700">
                Welcome, <span className="font-semibold">{user?.name}</span>
              </span>
              <Button variant="ghost" size="sm" onClick={logout} aria-label="Sign out">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8" id="main-content">
        <div className="space-y-8">
          {/* Available Teachers Section */}
          <section aria-labelledby="available-teachers-heading">
            <h2
              id="available-teachers-heading"
              className="text-2xl font-bold text-neutral-900 mb-6"
            >
              Available Teachers
            </h2>
            <ErrorBoundary section="Teachers">
              {teachersError ? (
                <SectionError message={teachersError} onRetry={refetchTeachers} />
              ) : (
                <TeacherList teachers={teachers} isLoading={teachersLoading} />
              )}
            </ErrorBoundary>
          </section>

          {/* Booking History and Chat History Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Booking History Section */}
            <section aria-labelledby="booking-history-heading">
              <h2 id="booking-history-heading" className="text-xl font-bold text-neutral-900 mb-4">
                Booking History
              </h2>
              <ErrorBoundary section="Booking History">
                {bookingsError ? (
                  <SectionError message={bookingsError} onRetry={refetchBookings} />
                ) : bookingsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse bg-neutral-200 h-32 rounded-lg"
                        role="status"
                        aria-label="Loading bookings"
                      />
                    ))}
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="space-y-4" role="list" aria-label="Recent bookings">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} role="listitem">
                        <BookingHistoryCard booking={booking} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg shadow-soft" role="status">
                    <svg
                      className="mx-auto h-12 w-12 text-neutral-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-neutral-900">No bookings yet</h3>
                    <p className="mt-2 text-sm text-neutral-500">
                      Start by booking a session with a teacher above.
                    </p>
                  </div>
                )}
              </ErrorBoundary>
            </section>

            {/* Chat History Section */}
            <section aria-labelledby="chat-history-heading">
              <h2 id="chat-history-heading" className="text-xl font-bold text-neutral-900 mb-4">
                Recent Conversations
              </h2>
              <ErrorBoundary section="Chat History">
                {conversationsError ? (
                  <SectionError message={conversationsError} onRetry={refetchConversations} />
                ) : conversationsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse bg-neutral-200 h-24 rounded-lg"
                        role="status"
                        aria-label="Loading conversations"
                      />
                    ))}
                  </div>
                ) : conversations.length > 0 ? (
                  <div className="space-y-4" role="list" aria-label="Recent conversations">
                    {conversations.slice(0, 5).map((conversation) => (
                      <div key={conversation.id} role="listitem">
                        <ChatHistoryCard
                          conversation={conversation}
                          currentUserId={user?.id || ''}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg shadow-soft" role="status">
                    <svg
                      className="mx-auto h-12 w-12 text-neutral-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-neutral-900">
                      No conversations yet
                    </h3>
                    <p className="mt-2 text-sm text-neutral-500">
                      Start chatting with your teachers after booking a session.
                    </p>
                  </div>
                )}
              </ErrorBoundary>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
