"use client"
import { useEffect, useState, createContext, useContext, ReactNode } from "react"
import { toast } from "sonner"
import setupAuthFetch from "./setup-auth-fetch"

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  emailVerified: boolean;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: string;
}

interface AuthContextType {
  session: AuthSession | null;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSession = async () => {
    try {
      setError(null);
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
      
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        setSession(data.user ? { 
          user: data.user, 
          token: data.session?.token || '',
          expiresAt: data.session?.expiresAt || ''
        } : null);
      } else {
        setSession(null);
      }
    } catch (err) {
      setError(err as Error);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      setError(null);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Set session from response
      setSession({
        user: data.user,
        token: data.token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });

      // Store token for API calls
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-token', data.token);
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setSession(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
      }
    }
  };

  const loginWithGoogle = async () => {
    window.location.href = '/api/auth/google';
  };

  const refetch = async () => {
    setIsLoading(true);
    await fetchSession();
  };

  useEffect(() => {
    // Setup fetch interceptor for auth tokens
    if (typeof window !== 'undefined') {
      setupAuthFetch();
    }
    fetchSession();
  }, []);

  const value: AuthContextType = {
    session,
    isLoading,
    error,
    login,
    register,
    logout,
    loginWithGoogle,
    refetch
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Backward compatibility hooks
export function useSession() {
  const { session, isLoading, error, refetch } = useAuth();
  return {
    data: session,
    isPending: isLoading,
    error,
    refetch
  };
}

// Legacy auth client object for backward compatibility
export const authClient = {
  async signIn(options: any) {
    throw new Error('Use useAuth hook instead of authClient.signIn');
  },
  async signUp(options: any) {
    throw new Error('Use useAuth hook instead of authClient.signUp');
  },
  async signOut() {
    throw new Error('Use useAuth hook instead of authClient.signOut');
  },
  async getSession() {
    const response = await fetch('/api/auth/session', {
      credentials: 'include'
    });
    return response.json();
  }
};