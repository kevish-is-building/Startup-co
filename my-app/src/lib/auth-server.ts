import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

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
  expiresAt: Date;
}

export class AuthError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function verifyToken(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    return { userId: decoded.userId, email: decoded.email };
  } catch (error) {
    return null;
  }
}

export async function getSessionFromRequest(request: NextRequest): Promise<AuthSession | null> {
  // Get token from cookies or Authorization header
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    return null;
  }

  // Check if session exists and is valid
  const session = await prisma.session.findFirst({
    where: { 
      userId: decoded.userId,
      token: token,
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          emailVerified: true
        }
      }
    }
  });

  if (!session) {
    return null;
  }

  return {
    user: session.user as AuthUser,
    token: session.token,
    expiresAt: session.expiresAt
  };
}

export async function requireAuth(request: NextRequest): Promise<AuthSession> {
  const session = await getSessionFromRequest(request);
  if (!session) {
    throw new AuthError('Authentication required', 'UNAUTHORIZED');
  }
  return session;
}

export async function generateAuthTokens(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new AuthError('User not found', 'USER_NOT_FOUND');
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Create session
  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    }
  });

  return { token, expiresAt };
}