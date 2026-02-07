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

    // Check if user exists
    const blockedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!blockedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create block (you'll need to add Block model to schema)
    // For now, we'll log it
    console.log('User block:', {
      blockerId: decoded.userId,
      blockedUserId: userId,
      timestamp: new Date(),
    });

    // TODO: Add Block model to schema and save to database
    // await prisma.block.create({
    //   data: {
    //     blockerId: decoded.userId,
    //     blockedId: userId,
    //   },
    // });

    // Delete any existing match
    await prisma.match.updateMany({
      where: {
        OR: [
          { user1Id: decoded.userId, user2Id: userId },
          { user1Id: userId, user2Id: decoded.userId },
        ],
      },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json(
      { message: 'User blocked successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Block user error:', error);
    return NextResponse.json(
      { error: 'Failed to block user' },
      { status: 500 }
    );
  }
}
