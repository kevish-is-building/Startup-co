import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies or Authorization header
    const cookieToken = request.cookies.get('auth-token')?.value;
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      
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
        return NextResponse.json({ user: null });
      }

      const response = NextResponse.json({ 
        user: session.user,
        session: {
          token: session.token,
          expiresAt: session.expiresAt
        }
      });

      // Re-set the cookie to keep it fresh (sliding window)
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      });

      return response;
    } catch (jwtError) {
      console.error('[Session] JWT verification failed:', jwtError instanceof Error ? jwtError.message : String(jwtError));
      return NextResponse.json({ user: null });
    }
  } catch (error) {
    console.error('[Session] Session check error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ user: null });
  }
}