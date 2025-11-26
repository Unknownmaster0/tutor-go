import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from '@/components/auth/protected-route';

const mockPush = vi.fn();
const mockUsePathname = vi.fn(() => '/dashboard');

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => mockUsePathname(),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state when auth is loading', () => {
    vi.mock('@/contexts/auth-context', () => ({
      useAuth: () => ({
        user: null,
        isLoading: true,
        isAuthenticated: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        refreshUser: vi.fn(),
      }),
    }));

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    vi.mock('@/contexts/auth-context', () => ({
      useAuth: () => ({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        refreshUser: vi.fn(),
      }),
    }));

    render(
      <ProtectedRoute requireAuth={true}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(mockPush).toHaveBeenCalled();
  });

  it('renders children when user is authenticated', () => {
    vi.mock('@/contexts/auth-context', () => ({
      useAuth: () => ({
        user: { id: '1', name: 'Test User', role: 'student', email: 'test@example.com' },
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        refreshUser: vi.fn(),
      }),
    }));

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('allows access when user role matches allowed roles', () => {
    vi.mock('@/contexts/auth-context', () => ({
      useAuth: () => ({
        user: { id: '1', name: 'Test User', role: 'tutor', email: 'test@example.com' },
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        refreshUser: vi.fn(),
      }),
    }));

    render(
      <ProtectedRoute allowedRoles={['tutor']}>
        <div>Tutor Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Tutor Content')).toBeInTheDocument();
  });
});
