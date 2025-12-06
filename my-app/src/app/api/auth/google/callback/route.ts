import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error || !code) {
      return NextResponse.redirect(`${request.nextUrl.origin}/login?error=google_auth_failed`);
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!googleClientId || !googleClientSecret) {
      return NextResponse.redirect(`${request.nextUrl.origin}/login?error=google_config_missing`);
    }

    const oauth2Client = new OAuth2Client(
      googleClientId,
      googleClientSecret,
      `${request.nextUrl.origin}/api/auth/google/callback`
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.redirect(`${request.nextUrl.origin}/login?error=google_auth_failed`);
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return NextResponse.redirect(`${request.nextUrl.origin}/login?error=no_email`);
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          email,
          name: name || email.split('@')[0],
          image: picture,
          emailVerified: true, // Google emails are verified
        }
      });

      // Create account record for Google OAuth
      await prisma.account.create({
        data: {
          id: crypto.randomUUID(),
          accountId: googleId,
          providerId: 'google',
          userId: user.id,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          idToken: tokens.id_token,
          accessTokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });
    } else {
      // Update existing account tokens
      const existingAccount = await prisma.account.findFirst({
        where: {
          userId: user.id,
          providerId: 'google'
        }
      });

      if (existingAccount) {
        await prisma.account.update({
          where: { id: existingAccount.id },
          data: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            idToken: tokens.id_token,
            accessTokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
            updatedAt: new Date(),
          }
        });
      } else {
        await prisma.account.create({
          data: {
            id: crypto.randomUUID(),
            accountId: googleId,
            providerId: 'google',
            userId: user.id,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            idToken: tokens.id_token,
            accessTokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        });
      }
    }

    // Generate JWT token for our app
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }
    });

    // Redirect to auth callback page with token in cookie
    const response = NextResponse.redirect(`${request.nextUrl.origin}/auth/callback`);
    
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;

  } catch (error) {
    console.error('Google auth callback error:', error);
    return NextResponse.redirect(`${request.nextUrl.origin}/login?error=google_auth_failed`);
  }
}