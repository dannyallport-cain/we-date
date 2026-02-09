import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateDistance } from '@/lib/location';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
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

    const { userId } = await params;

    // Fetch the requested user's profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        dateOfBirth: true,
        gender: true,
        bio: true,
        jobTitle: true,
        company: true,
        school: true,
        height: true,
        location: true,
        latitude: true,
        longitude: true,
        isVerified: true,
        isActive: true,
        lastActive: true,
        photos: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            url: true,
            order: true,
            isPrimary: true,
          },
        },
        interests: {
          include: {
            interest: {
              select: {
                id: true,
                name: true,
                icon: true,
              },
            },
          },
        },
        prompts: {
          select: {
            id: true,
            answer: true,
            prompt: {
              select: {
                id: true,
                question: true,
              }
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get current user's location to calculate distance
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        latitude: true,
        longitude: true,
      },
    });

    // Calculate distance if both users have location
    let distance = null;
    if (
      currentUser?.latitude &&
      currentUser?.longitude &&
      user.latitude &&
      user.longitude
    ) {
      distance = calculateDistance(
        { latitude: currentUser.latitude, longitude: currentUser.longitude },
        { latitude: user.latitude, longitude: user.longitude }
      );
    }

    // Calculate age
    const age = calculateAge(new Date(user.dateOfBirth));

    // Format interests
    const interests = user.interests.map((ui) => ({
      id: ui.interest.id,
      name: ui.interest.name,
      icon: ui.interest.icon,
    }));

    // Format prompts
    const prompts = user.prompts.map((up) => ({
      id: up.id,
      promptId: up.prompt.id,
      promptText: up.prompt.question,
      answer: up.answer,
    }));

    // Check if already matched or swiped
    const existingSwipe = await prisma.swipe.findFirst({
      where: {
        userId: decoded.userId,
        targetUserId: userId,
      },
      select: {
        action: true,
      },
    });

    const existingMatch = await prisma.match.findFirst({
      where: {
        OR: [
          { user1Id: decoded.userId, user2Id: userId },
          { user1Id: userId, user2Id: decoded.userId },
        ],
        isActive: true,
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        displayName: user.displayName,
        age,
        gender: user.gender,
        bio: user.bio,
        jobTitle: user.jobTitle,
        company: user.company,
        school: user.school,
        height: user.height,
        location: user.location,
        distance,
        isVerified: user.isVerified,
        lastActive: user.lastActive,
        photos: user.photos,
        interests,
        prompts,
        alreadySwiped: existingSwipe ? existingSwipe.action : null,
        isMatched: !!existingMatch,
      },
    });
  } catch (error) {
    console.error('GET user profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
