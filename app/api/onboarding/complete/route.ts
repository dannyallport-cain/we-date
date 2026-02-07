import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Mark user as active (onboarding complete)
    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        isActive: true,
        lastActive: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: 'Onboarding completed successfully',
        user: {
          id: user.id,
          displayName: user.displayName,
          isActive: user.isActive,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Complete onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
