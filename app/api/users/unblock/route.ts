import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Get token from Authorization header or cookie
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Delete the block
    await prisma.block.deleteMany({
      where: {
        userId: decoded.userId,
        blockedUserId: userId,
      },
    });

    return NextResponse.json(
      { message: 'User unblocked successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unblock user error:', error);
    return NextResponse.json(
      { error: 'Failed to unblock user' },
      { status: 500 }
    );
  }
}