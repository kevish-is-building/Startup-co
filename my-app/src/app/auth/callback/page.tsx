'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import AuthCallbackContent from '../callback-content';

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-teal-50 via-white to-blue-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <p className="text-lg text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}