/**
 * Location utility functions for distance calculation and geocoding
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData extends Coordinates {
  city?: string;
  state?: string;
  country?: string;
  formattedAddress?: string;
}

/**
 * Calculate distance between two points using Haversine formula
 * @param point1 - First coordinate
 * @param point2 - Second coordinate
 * @returns Distance in miles
 */
export function calculateDistance(
  point1: Coordinates,
  point2: Coordinates
): number {
  const R = 3959; // Earth's radius in miles (use 6371 for kilometers)
  
  const lat1 = toRadians(point1.latitude);
  const lat2 = toRadians(point2.latitude);
  const deltaLat = toRadians(point2.latitude - point1.latitude);
  const deltaLon = toRadians(point2.longitude - point1.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get current GPS location from browser
 * @returns Promise with coordinates or error
 */
export async function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(`Location error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Reverse geocode coordinates to city/state/country using Google Maps API
 * @param coordinates - Latitude and longitude
 * @returns Location data with formatted address
 */
export async function reverseGeocode(
  coordinates: Coordinates
): Promise<LocationData> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.latitude},${coordinates.longitude}&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK' || !data.results || data.results.length === 0) {
    throw new Error('Failed to reverse geocode location');
  }

  const result = data.results[0];
  const addressComponents = result.address_components;

  let city = '';
  let state = '';
  let country = '';

  for (const component of addressComponents) {
    if (component.types.includes('locality')) {
      city = component.long_name;
    }
    if (component.types.includes('administrative_area_level_1')) {
      state = component.short_name;
    }
    if (component.types.includes('country')) {
      country = component.long_name;
    }
  }

  return {
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    city,
    state,
    country,
    formattedAddress: result.formatted_address,
  };
}

/**
 * Forward geocode an address to coordinates using Google Maps API
 * @param address - Address string (e.g., "San Francisco, CA")
 * @returns Coordinates and location data
 */
export async function forwardGeocode(address: string): Promise<LocationData> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK' || !data.results || data.results.length === 0) {
    throw new Error('Failed to geocode address');
  }

  const result = data.results[0];
  const location = result.geometry.location;
  const addressComponents = result.address_components;

  let city = '';
  let state = '';
  let country = '';

  for (const component of addressComponents) {
    if (component.types.includes('locality')) {
      city = component.long_name;
    }
    if (component.types.includes('administrative_area_level_1')) {
      state = component.short_name;
    }
    if (component.types.includes('country')) {
      country = component.long_name;
    }
  }

  return {
    latitude: location.lat,
    longitude: location.lng,
    city,
    state,
    country,
    formattedAddress: result.formatted_address,
  };
}

/**
 * Format distance for display
 * @param miles - Distance in miles
 * @returns Formatted string (e.g., "2.5 miles away", "< 1 mile away")
 */
export function formatDistance(miles: number): string {
  if (miles < 1) {
    return '< 1 mile away';
  }
  if (miles < 10) {
    return `${miles.toFixed(1)} miles away`;
  }
  return `${Math.round(miles)} miles away`;
}

/**
 * Validate coordinates
 * @param latitude - Latitude value
 * @param longitude - Longitude value
 * @returns True if valid coordinates
 */
export function isValidCoordinates(latitude: number, longitude: number): boolean {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}
