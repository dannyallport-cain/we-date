import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
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

    // Get blocked users
    const blockedUsers = await prisma.block.findMany({
      where: { userId: decoded.userId },
      include: {
        blockedUser: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedBlockedUsers = blockedUsers.map(block => ({
      id: block.blockedUser.id,
      displayName: block.blockedUser.displayName,
      blockedAt: block.createdAt.toISOString(),
    }));

    return NextResponse.json({ blockedUsers: formattedBlockedUsers });
  } catch (error) {
    console.error('Get blocked users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blocked users' },
      { status: 500 }
    );
  }
}