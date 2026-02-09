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

    const { userId, reason } = await req.json();

    if (!userId || !reason) {
      return NextResponse.json(
        { error: 'User ID and reason are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const reportedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!reportedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create report
    await prisma.report.create({
      data: {
        reporterId: decoded.userId,
        reportedUserId: userId,
        reason,
        description: reason === 'OTHER' ? 'Other reason' : null,
      },
    });

    return NextResponse.json(
      { message: 'Report submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Report user error:', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}
