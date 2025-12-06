'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-client';

export default function TestAuthPage() {
  const { session, isLoading, login } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<any>({});
  const [tokenExists, setTokenExists] = useState(false);
  const [mounted, setMounted] = useState(false);

  const addLog = (message: string) => {
    console.log(message);
    setLogs((prev) => [...prev, message]);
  };

  useEffect(() => {
    setMounted(true);
    // Check token on mount
    const token = localStorage.getItem('auth-token');
    setTokenExists(!!token);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;

    const runDiagnostics = async () => {
      addLog('🔍 Starting auth diagnostics...');

      // Check localStorage
      const token = localStorage.getItem('auth-token');
      addLog(`📦 localStorage token: ${token ? 'EXISTS' : 'MISSING'}`);
      if (token) {
        addLog(`   Token length: ${token.length}`);
      }

      // Check session
      addLog(`👤 Current session: ${session ? 'EXISTS' : 'NULL'}`);
      if (session) {
        addLog(`   User: ${session.user?.email}`);
      }

      // Check cookies
      const cookies = document.cookie;
      const hasAuthCookie = cookies.includes('auth-token');
      addLog(`🍪 Auth cookie: ${hasAuthCookie ? 'EXISTS' : 'MISSING'}`);
      addLog(`   All cookies: ${cookies ? cookies.substring(0, 100) : 'NONE'}`);

      // Test API call
      try {
        addLog('🌐 Testing /api/auth/session...');
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
        });
        addLog(`   Status: ${response.status}`);
        const data = await response.json();
        addLog(`   Response: ${JSON.stringify(data).substring(0, 100)}`);
        setTestResults((prev: any) => ({
          ...prev,
          sessionEndpoint: {
            status: response.status,
            hasUser: !!data.user,
            userData: data.user?.email,
          },
        }));
      } catch (err) {
        addLog(`   ❌ Error: ${err}`);
      }

      addLog('✅ Diagnostics complete!');
    };

    runDiagnostics();
  }, [mounted, isLoading, session]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Auth Diagnostics</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Auth Diagnostics</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current State</h2>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-semibold">Loading:</span> {isLoading ? '⏳' : '✓'}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Session:</span> {session ? '✓ Authenticated' : '✗ Not authenticated'}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Email:</span> {session?.user?.email || 'N/A'}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Token in localStorage:</span>{' '}
              {tokenExists ? '✓' : '✗'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Diagnostic Logs</h2>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-auto">
            {logs.map((log, idx) => (
              <div key={idx}>{log}</div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('auth-token');
              setLogs([]);
              window.location.reload();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear Token & Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
