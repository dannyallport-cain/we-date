import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  generateVerificationCode,
  sendVerificationEmail,
  sendWelcomeEmail,
} from '@/lib/email';

// Store verification codes in memory (in production, use Redis)
const verificationCodes = new Map<
  string,
  { code: string; expiresAt: number; attempts: number }
>();

// Rate limiting
const rateLimits = new Map<string, { count: number; resetAt: number }>();

const MAX_ATTEMPTS = 3;
const CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 3;

/**
 * POST /api/auth/verify-email/send - Send verification code
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.isEmailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    // Check rate limit
    const now = Date.now();
    const userRateLimit = rateLimits.get(user.id);

    if (userRateLimit) {
      if (now < userRateLimit.resetAt) {
        if (userRateLimit.count >= MAX_REQUESTS_PER_MINUTE) {
          return NextResponse.json(
            { error: 'Too many requests. Please wait a minute.' },
            { status: 429 }
          );
        }
        userRateLimit.count++;
      } else {
        rateLimits.set(user.id, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
      }
    } else {
      rateLimits.set(user.id, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    }

    // Generate verification code
    const code = generateVerificationCode();
    const expiresAt = now + CODE_EXPIRY;

    // Store code
    verificationCodes.set(user.id, { code, expiresAt, attempts: 0 });

    // Send email
    await sendVerificationEmail(user.email, code, user.displayName);

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
      expiresIn: CODE_EXPIRY / 1000, // In seconds
    });
  } catch (error) {
    console.error('Send verification email error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/verify-email/send - Verify code
 * Body: { code: string }
 */
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.isEmailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    // Get stored code
    const storedCode = verificationCodes.get(user.id);

    if (!storedCode) {
      return NextResponse.json(
        { error: 'No verification code found. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check expiry
    if (Date.now() > storedCode.expiresAt) {
      verificationCodes.delete(user.id);
      return NextResponse.json(
        { error: 'Verification code expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check attempts
    if (storedCode.attempts >= MAX_ATTEMPTS) {
      verificationCodes.delete(user.id);
      return NextResponse.json(
        { error: 'Too many failed attempts. Please request a new code.' },
        { status: 400 }
      );
    }

    // Verify code
    if (code.trim() !== storedCode.code) {
      storedCode.attempts++;
      return NextResponse.json(
        {
          error: 'Invalid verification code',
          attemptsRemaining: MAX_ATTEMPTS - storedCode.attempts,
        },
        { status: 400 }
      );
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
    });

    // Clean up
    verificationCodes.delete(user.id);

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.displayName);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't fail the verification if welcome email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully!',
    });
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}
