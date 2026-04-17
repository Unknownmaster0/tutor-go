import { NextRequest, NextResponse } from 'next/server';

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/booking', '/bookings', '/chat', '/admin'];

// Public routes that only unauthenticated users can access
const publicAuthRoutes = ['/auth/login', '/auth/register', '/'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('accessToken')?.value;

  // Check if user is authenticated
  const isAuthenticated = !!token;

  // Redirect authenticated users away from public auth routes
  if (isAuthenticated && publicAuthRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users trying to access protected routes
  if (!isAuthenticated && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(
      new URL(`/auth/login?redirect=${encodeURIComponent(pathname)}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files, api routes, and next assets
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
