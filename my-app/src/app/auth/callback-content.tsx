'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refetch } = useAuth();
  const error = searchParams.get('error');

  useEffect(() => {
    const completeAuth = async () => {
      if (error) {
        router.push(`/login?error=${error}`);
        return;
      }

      // Refetch session to get the authenticated state
      try {
        await refetch();
        
        // Small delay to ensure token is properly set
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if session was established
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
          headers: token ? {
            'Authorization': `Bearer ${token}`
          } : {}
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            // Session established, redirect to dashboard
            router.push('/dashboard');
          } else {
            console.error('No user in session response:', data);
            router.push('/login?error=session_failed');
          }
        } else {
          console.error('Session check failed:', response.status);
          router.push('/login?error=session_failed');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        router.push('/login?error=callback_error');
      }
    };

    completeAuth();
  }, [error, router, refetch]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-teal-50 via-white to-blue-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <p className="text-lg text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}
