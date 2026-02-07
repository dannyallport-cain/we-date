import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';

// Lazy configuration
let isConfigured = false;

function ensureConfigured() {
  if (!isConfigured) {
    const hasCredentials = 
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (!hasCredentials) {
      console.warn('⚠️  Cloudinary not configured - using mock uploader for testing');
    } else {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
    }
    isConfigured = true;
  }
}

export interface UploadResult {
  public_id: string;
  url: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
}

/**
 * Upload image to Cloudinary with optimizations
 * @param file - Base64 encoded image string
 * @param folder - Cloudinary folder name (default: 'wedate/profiles')
 */
export async function uploadImage(
  file: string,
  folder: string = 'wedate/profiles'
): Promise<UploadResult> {
  ensureConfigured();
  try {
    // Check if Cloudinary is actually configured
    const hasCredentials = 
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (!hasCredentials) {
      // Use mock uploader for testing/development
      return mockUploadImage(file, folder);
    }

    const result = await cloudinary.uploader.upload(file, {
      folder,
      transformation: [
        { width: 800, height: 800, crop: 'fill', gravity: 'face' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }, // Auto WebP conversion
      ],
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    });

    return result as UploadResult;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Mock uploader for testing when Cloudinary is not configured
 */
function mockUploadImage(file: string, folder: string): UploadResult {
  // Generate a fake public_id
  const publicId = `${folder}/${crypto.randomBytes(8).toString('hex')}`;
  
  // Use a placeholder image URL
  const placeholderUrl = `https://via.placeholder.com/800x800?text=Test+Photo`;
  
  return {
    public_id: publicId,
    url: placeholderUrl,
    secure_url: placeholderUrl,
    width: 800,
    height: 800,
    format: 'jpg',
    resource_type: 'image',
    created_at: new Date().toISOString(),
    bytes: file.length,
  };
}

/**
 * Delete image from Cloudinary
 * @param publicId - The public_id of the image to delete
 */
export async function deleteImage(publicId: string): Promise<void> {
  ensureConfigured();
  try {
    // Check if Cloudinary is configured
    const hasCredentials = 
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (!hasCredentials) {
      // Skip deletion for mock uploader
      console.log('Mock delete for:', publicId);
      return;
    }

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image');
  }
}

/**
 * Get optimized image URL with transformations
 * @param publicId - The public_id of the image
 * @param width - Optional width
 * @param height - Optional height
 */
export function getOptimizedImageUrl(
  publicId: string,
  width?: number,
  height?: number
): string {
  // Check if this is a mock URL (doesn't contain cloudinary domain)
  if (!publicId.includes('cloudinary') && publicId.includes('placeholder')) {
    return publicId; // Return as-is for placeholder URLs
  }

  // For real Cloudinary URLs
  const hasCredentials = 
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (!hasCredentials) {
    // Return placeholder for mock mode
    return `https://via.placeholder.com/${width || 800}x${height || 800}`;
  }

  return cloudinary.url(publicId, {
    width: width || 800,
    height: height || 800,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto:good',
    fetch_format: 'auto',
  });
}

/**
 * Extract public_id from Cloudinary URL
 * @param url - Full Cloudinary URL
 * @returns public_id or null if not a valid Cloudinary URL
 */
export function extractPublicId(url: string): string | null {
  try {
    // Cloudinary URL format: https://res.cloudinary.com/CLOUD_NAME/image/upload/v1234567890/folder/file.ext
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

export default cloudinary;
