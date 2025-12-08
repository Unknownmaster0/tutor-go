import { useSearchParams } from 'next/navigation';

/**
 * Hook to get the redirect URL after login
 */
export function useRedirectAfterLogin() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  return redirect || '/dashboard';
}
