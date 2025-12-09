import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Custom hook to use authentication context
 * Provides access to user, authentication methods, and auth state
 */
export const useAuth = () => {
  const context = useAuthContext();
  return context;
};
