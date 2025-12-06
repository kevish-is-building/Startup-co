import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies or Authorization header
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

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

      return NextResponse.json({ 
        user: session.user,
        session: {
          token: session.token,
          expiresAt: session.expiresAt
        }
      });
    } catch (jwtError) {
      return NextResponse.json({ user: null });
    }
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ user: null });
  }
}