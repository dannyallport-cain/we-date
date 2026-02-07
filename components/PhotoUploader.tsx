'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface Photo {
  id: string;
  url: string;
  order: number;
  isPrimary: boolean;
}

interface PhotoUploaderProps {
  userId?: string;
  onPhotosChange?: (photos: Photo[]) => void;
  onPhotoCountChange?: (count: number) => void;
}

const MAX_PHOTOS = 9;
const MIN_PHOTOS = 2;

export default function PhotoUploader({ 
  userId, 
  onPhotosChange, 
  onPhotoCountChange 
}: PhotoUploaderProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile/photos', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos);
        if (onPhotosChange) {
          onPhotosChange(data.photos);
        }
        if (onPhotoCountChange) {
          onPhotoCountChange(data.photos.length);
        }
      }
    } catch (error) {
      console.error('Failed to fetch photos:', error);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and WebP files are allowed');
      return;
    }

    if (photos.length >= MAX_PHOTOS) {
      toast.error(`Maximum ${MAX_PHOTOS} photos allowed`);
      return;
    }

    await uploadPhoto(file);
  };

  const uploadPhoto = async (file: File) => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile/photos', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const newPhotos = [...photos, data.photo].sort((a, b) => a.order - b.order);
        setPhotos(newPhotos);
        if (onPhotosChange) {
          onPhotosChange(newPhotos);
        }
        if (onPhotoCountChange) {
          onPhotoCountChange(newPhotos.length);
        }
        toast.success('Photo uploaded successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (photoId: string) => {
    if (photos.length <= MIN_PHOTOS) {
      toast.error(`Minimum ${MIN_PHOTOS} photos required`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/profile/photos?photoId=${photoId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const newPhotos = photos.filter((p) => p.id !== photoId);
        setPhotos(newPhotos);
        if (onPhotosChange) {
          onPhotosChange(newPhotos);
        }
        if (onPhotoCountChange) {
          onPhotoCountChange(newPhotos.length);
        }
        toast.success('Photo deleted');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete photo');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete photo');
    }
  };

  const setPrimaryPhoto = async (photoId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile/photos', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          photoId,
          action: 'setPrimary',
        }),
      });

      if (response.ok) {
        const newPhotos = photos.map((p) => ({
          ...p,
          isPrimary: p.id === photoId,
        }));
        setPhotos(newPhotos);
        if (onPhotosChange) {
          onPhotosChange(newPhotos);
        }
        if (onPhotoCountChange) {
          onPhotoCountChange(newPhotos.length);
        }
        toast.success('Primary photo updated');
      }
    } catch (error) {
      console.error('Set primary error:', error);
      toast.error('Failed to set primary photo');
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPhotos = [...photos];
    const draggedPhoto = newPhotos[draggedIndex];
    newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(index, 0, draggedPhoto);

    // Update orders
    newPhotos.forEach((photo, idx) => {
      photo.order = idx;
    });

    setPhotos(newPhotos);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    if (onPhotosChange) {
      onPhotosChange(photos);
    }
  };

  // Create empty slots for remaining photos
  const emptySlots = MAX_PHOTOS - photos.length;

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Photos ({photos.length}/{MAX_PHOTOS})
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Add {MIN_PHOTOS}-{MAX_PHOTOS} photos. Drag to reorder.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-move group"
          >
            <Image
              src={photo.url}
              alt={`Photo ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 200px"
            />

            {/* Primary badge */}
            {photo.isPrimary && (
              <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Primary
              </div>
            )}

            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              {!photo.isPrimary && (
                <button
                  onClick={() => setPrimaryPhoto(photo.id)}
                  className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-100"
                >
                  Set Primary
                </button>
              )}
              <button
                onClick={() => deletePhoto(photo.id)}
                className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {/* Empty slots and upload button */}
        {Array.from({ length: emptySlots }).map((_, index) => (
          <label
            key={`empty-${index}`}
            className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-pink-500 transition-colors cursor-pointer flex items-center justify-center bg-gray-50"
          >
            {index === 0 && !uploading ? (
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">Add photo</p>
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
              </div>
            ) : uploading && index === 0 ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Uploading...</p>
              </div>
            ) : null}
          </label>
        ))}
      </div>

      {photos.length < MIN_PHOTOS && (
        <p className="mt-4 text-sm text-red-600">
          ⚠️ You need at least {MIN_PHOTOS} photos to complete your profile
        </p>
      )}
    </div>
  );
}
