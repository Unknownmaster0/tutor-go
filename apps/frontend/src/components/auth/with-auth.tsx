'use client';

import { ComponentType } from 'react';
import { ProtectedRoute } from './protected-route';
import { UserRole } from '@/types/auth.types';

interface WithAuthOptions {
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

/**
 * Higher-order component that wraps a component with authentication protection
 */
export function withAuth<P extends object>(
  Component: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const { allowedRoles, requireAuth = true } = options;

  return function WithAuthComponent(props: P) {
    return (
      <ProtectedRoute allowedRoles={allowedRoles} requireAuth={requireAuth}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
