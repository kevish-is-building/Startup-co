/**
 * Enhanced fetch with automatic auth token injection
 * This ensures all API requests include the JWT token
 */

let isSetup = false;
const originalFetch = global.fetch;

export function setupAuthFetch() {
  if (isSetup) return;
  isSetup = true;

  global.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    let url = input instanceof URL ? input.href : typeof input === 'string' ? input : (input as any).url;
    
    const isApiCall = url.includes('/api/');
    
    if (isApiCall) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
      const headers = new Headers(init?.headers || {});
      
      // Add token if available and not already present
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      // Always include credentials for API calls
      const mergedInit: RequestInit = {
        ...init,
        headers,
        credentials: 'include'
      };
      
      return originalFetch(input, mergedInit);
    }
    
    return originalFetch(input, init);
  } as any;
}

export default setupAuthFetch;