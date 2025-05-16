import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of public routes that don't require authentication
const publicRoutes = ['/landing', '/login', '/register'];

// List of routes that should redirect to dashboard if authenticated
const authRedirectRoutes = ['/', '/login', '/register', '/landing'];

export function middleware(request: NextRequest) {
  // Get the path from the URL
  const path = request.nextUrl.pathname;
  
  // Check if we have an auth cookie
  const isAuthenticated = request.cookies.has('jwt');
  
  // If user is authenticated and trying to access an auth page or root, redirect to dashboard
  if (isAuthenticated && authRedirectRoutes.includes(path)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is not authenticated and trying to access a protected route
  if (!isAuthenticated && !publicRoutes.includes(path) && !path.startsWith('/api')) {
    // Store the original URL to redirect back after login
    const loginUrl = new URL('/landing', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Define which paths this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 