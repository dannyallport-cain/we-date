import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadImage, deleteImage, extractPublicId } from '@/lib/cloudinary';

const MAX_PHOTOS = 9;
const MIN_PHOTOS = 2;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * GET /api/profile/photos - Get all photos for authenticated user
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

    const photos = await prisma.photo.findMany({
      where: { userId: decoded.userId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('GET photos error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/profile/photos - Upload a new photo
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

    const formData = await request.formData();
    const file = formData.get('photo') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and WebP are allowed' },
        { status: 400 }
      );
    }

    // Check current photo count
    const photoCount = await prisma.photo.count({
      where: { userId: decoded.userId },
    });

    if (photoCount >= MAX_PHOTOS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_PHOTOS} photos allowed` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await uploadImage(
      `data:${file.type};base64,${buffer.toString('base64')}`
    );

    // Determine if this should be the primary photo
    const isPrimary = photoCount === 0;

    // Create photo record
    const photo = await prisma.photo.create({
      data: {
        url: uploadResult.secure_url,
        userId: decoded.userId,
        order: photoCount,
        isPrimary,
      },
    });

    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    console.error('POST photo error:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profile/photos - Delete a photo
 */
export async function DELETE(request: NextRequest) {
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
    const photoId = searchParams.get('photoId');

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      );
    }

    // Find the photo
    const photo = await prisma.photo.findFirst({
      where: {
        id: photoId,
        userId: decoded.userId,
      },
    });

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Check if we're about to go below minimum
    const photoCount = await prisma.photo.count({
      where: { userId: decoded.userId },
    });

    if (photoCount <= MIN_PHOTOS) {
      return NextResponse.json(
        { error: `Minimum ${MIN_PHOTOS} photos required` },
        { status: 400 }
      );
    }

    // Delete from Cloudinary
    const publicId = extractPublicId(photo.url);
    if (publicId) {
      await deleteImage(publicId);
    }

    // Delete from database
    await prisma.photo.delete({
      where: { id: photoId },
    });

    // If deleted photo was primary, set another as primary
    if (photo.isPrimary) {
      const nextPhoto = await prisma.photo.findFirst({
        where: { userId: decoded.userId },
        orderBy: { order: 'asc' },
      });

      if (nextPhoto) {
        await prisma.photo.update({
          where: { id: nextPhoto.id },
          data: { isPrimary: true },
        });
      }
    }

    // Reorder remaining photos
    const remainingPhotos = await prisma.photo.findMany({
      where: { userId: decoded.userId },
      orderBy: { order: 'asc' },
    });

    for (let i = 0; i < remainingPhotos.length; i++) {
      await prisma.photo.update({
        where: { id: remainingPhotos[i].id },
        data: { order: i },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE photo error:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile/photos - Update photo order or set primary
 */
export async function PATCH(request: NextRequest) {
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
    const { photoId, action, newOrder } = body;

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      );
    }

    // Verify photo belongs to user
    const photo = await prisma.photo.findFirst({
      where: {
        id: photoId,
        userId: decoded.userId,
      },
    });

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    if (action === 'setPrimary') {
      // Unset current primary
      await prisma.photo.updateMany({
        where: {
          userId: decoded.userId,
          isPrimary: true,
        },
        data: { isPrimary: false },
      });

      // Set new primary
      await prisma.photo.update({
        where: { id: photoId },
        data: { isPrimary: true },
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'reorder' && typeof newOrder === 'number') {
      await prisma.photo.update({
        where: { id: photoId },
        data: { order: newOrder },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('PATCH photo error:', error);
    return NextResponse.json(
      { error: 'Failed to update photo' },
      { status: 500 }
    );
  }
}
