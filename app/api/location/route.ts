import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  reverseGeocode,
  forwardGeocode,
  isValidCoordinates,
  getCurrentLocation,
  type LocationData,
} from '@/lib/location';

/**
 * GET /api/location - Get user's current location
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        latitude: true,
        longitude: true,
        location: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      latitude: user.latitude,
      longitude: user.longitude,
      location: user.location,
    });
  } catch (error) {
    console.error('GET location error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/location - Update user's location
 * Body: { latitude, longitude } or { address }
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
    const { latitude, longitude, address } = body;

    let locationData: LocationData;

    // If GPS coordinates provided, use them
    if (latitude !== undefined && longitude !== undefined) {
      if (!isValidCoordinates(latitude, longitude)) {
        return NextResponse.json(
          { error: 'Invalid coordinates' },
          { status: 400 }
        );
      }

      // Reverse geocode to get city/state
      locationData = await reverseGeocode({ latitude, longitude });
    }
    // If address provided, geocode it
    else if (address) {
      locationData = await forwardGeocode(address);
    } else {
      return NextResponse.json(
        { error: 'Either coordinates or address is required' },
        { status: 400 }
      );
    }

    // Update user location in database
    const locationString = locationData.city
      ? `${locationData.city}${locationData.state ? `, ${locationData.state}` : ''}`
      : locationData.formattedAddress;

    await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        location: locationString,
      },
    });

    return NextResponse.json({
      success: true,
      location: locationString,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      city: locationData.city,
      state: locationData.state,
      country: locationData.country,
    });
  } catch (error) {
    console.error('POST location error:', error);
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/location/reverse-geocode - Reverse geocode coordinates
 * Body: { latitude, longitude }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { latitude, longitude } = body;

    if (!isValidCoordinates(latitude, longitude)) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    const locationData = await reverseGeocode({ latitude, longitude });

    return NextResponse.json(locationData);
  } catch (error) {
    console.error('Reverse geocode error:', error);
    return NextResponse.json(
      { error: 'Failed to reverse geocode location' },
      { status: 500 }
    );
  }
}
