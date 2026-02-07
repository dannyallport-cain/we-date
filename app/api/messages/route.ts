import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/messages - Get messages for a specific match
 * Query params: matchId
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('matchId');
    const since = searchParams.get('since'); // For polling: get messages after this timestamp

    if (!matchId) {
      return NextResponse.json(
        { error: 'Match ID is required' },
        { status: 400 }
      );
    }

    // Verify match exists and user is part of it
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [
          { user1Id: decoded.userId },
          { user2Id: decoded.userId },
        ],
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Build where clause
    const whereClause: any = { matchId };
    
    if (since) {
      whereClause.createdAt = {
        gt: new Date(since),
      };
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
            photos: {
              where: { isPrimary: true },
              select: { url: true },
              take: 1,
            },
          },
        },
        match: {
          select: {
            user1Id: true,
            user2Id: true,
          },
        },
      },
    });

    // Determine receiverId for each message and mark messages as read
    const messageIds = messages
      .filter((msg) => {
        // Receiver is the other user in the match (not the sender)
        const receiverId =
          msg.match.user1Id === msg.senderId
            ? msg.match.user2Id
            : msg.match.user1Id;
        return receiverId === decoded.userId && !msg.isRead;
      })
      .map((msg) => msg.id);

    if (messageIds.length > 0) {
      await prisma.message.updateMany({
        where: {
          id: { in: messageIds },
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('GET messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages - Send a new message
 * Body: { matchId, content, type: 'TEXT' | 'IMAGE' }
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

    const body = await request.json();
    const { matchId, content, type = 'TEXT', imageUrl } = body;

    if (!matchId) {
      return NextResponse.json(
        { error: 'Match ID is required' },
        { status: 400 }
      );
    }

    if (!content && !imageUrl) {
      return NextResponse.json(
        { error: 'Message content or image is required' },
        { status: 400 }
      );
    }

    // Verify match exists and user is part of it
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [
          { user1Id: decoded.userId },
          { user2Id: decoded.userId },
        ],
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Determine receiver ID
    const receiverId =
      match.user1Id === decoded.userId ? match.user2Id : match.user1Id;

    // Create message
    const message = await prisma.message.create({
      data: {
        matchId,
        senderId: decoded.userId,
        content: content || null,
        contentType: type as any,
        mediaUrl: imageUrl || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
            photos: {
              where: { isPrimary: true },
              select: { url: true },
              take: 1,
            },
          },
        },
      },
    });

    // TODO: Send push notification to receiver

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('POST message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
