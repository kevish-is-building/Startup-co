import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionFromRequest } from './src/lib/auth-server';

// Add paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/onboarding',
  '/profile',
  '/tasks',
  '/blueprint',
  '/templates',
  '/playbook',
  '/admin'
];

// Add paths that should redirect to dashboard if user is already authenticated
const authPaths = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  try {
    const session = await getSessionFromRequest(request);
    const isAuthenticated = !!session;
    // Check if the path requires authentication
    const isProtectedPath = protectedPaths.some(path => 
      pathname.startsWith(path)
    );
    
    // Check if this is an auth page (login/register)
    const isAuthPath = authPaths.some(path => 
      pathname.startsWith(path)
    );
    
    console.log("------>>>>>>", isAuthenticated, isAuthPath)
    // Redirect to login if accessing protected route without authentication
    if (isProtectedPath && !isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Redirect to dashboard if accessing auth pages while authenticated
    if (isAuthPath && isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Allow the request to continue
    return NextResponse.next();
  } catch (error) {
    // If there's an error (e.g., invalid token), allow the request but clear any auth cookies
    console.error('Middleware auth error:', error);
    
    const response = NextResponse.next();
    response.cookies.delete('auth-token');
    
    return response;
  }
}

export const config = {
  matcher: ["/dashboard", "/blueprint", "/tasks", "/legal", "/templates", "/admin", "/onboarding", "/login", "/register"],
};