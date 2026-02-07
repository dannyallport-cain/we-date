'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getCurrentLocation } from '@/lib/location';

interface LocationPickerProps {
  onLocationSet?: (location: {
    latitude: number;
    longitude: number;
    locationString: string;
  }) => void;
  initialLocation?: string;
}

export default function LocationPicker({ onLocationSet, initialLocation }: LocationPickerProps) {
  const [useGPS, setUseGPS] = useState(true);
  const [loading, setLoading] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [currentLocation, setCurrentLocation] = useState<string | null>(initialLocation || null);

  const handleGetGPSLocation = async () => {
    setLoading(true);
    try {
      // Get GPS coordinates from browser
      const coords = await getCurrentLocation();

      // Send to API to reverse geocode and save
      const token = localStorage.getItem('token');
      const response = await fetch('/api/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude: coords.latitude,
          longitude: coords.longitude,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentLocation(data.location);
        toast.success(`Location set to ${data.location}`);
        
        if (onLocationSet) {
          onLocationSet({
            latitude: data.latitude,
            longitude: data.longitude,
            locationString: data.location,
          });
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save location');
      }
    } catch (error: any) {
      console.error('GPS location error:', error);
      toast.error(error.message || 'Failed to get GPS location. Please enable location services.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!manualAddress.trim()) {
      toast.error('Please enter a city name');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          address: manualAddress,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentLocation(data.location);
        toast.success(`Location set to ${data.location}`);
        
        if (onLocationSet) {
          onLocationSet({
            latitude: data.latitude,
            longitude: data.longitude,
            locationString: data.location,
          });
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to find location');
      }
    } catch (error) {
      console.error('Manual location error:', error);
      toast.error('Failed to set location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Set Your Location
        </h3>
        {currentLocation && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg mb-3">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm font-medium">
              📍 {currentLocation}
            </span>
          </div>
        )}
      </div>

      {/* Toggle between GPS and Manual */}
      <div className="bg-gray-100 rounded-lg p-1 flex mb-4">
        <button
          onClick={() => setUseGPS(true)}
          className={`flex-1 px-4 py-2 rounded-md font-medium text-sm transition-all ${
            useGPS
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📍 Use GPS
        </button>
        <button
          onClick={() => setUseGPS(false)}
          className={`flex-1 px-4 py-2 rounded-md font-medium text-sm transition-all ${
            !useGPS
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🌍 Enter City
        </button>
      </div>

      {useGPS ? (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Allow access to your device location for accurate matching with nearby people.
          </p>
          <button
            onClick={handleGetGPSLocation}
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Getting Location...
              </span>
            ) : (
              'Get Current Location'
            )}
          </button>
        </div>
      ) : (
        <form onSubmit={handleManualLocationSubmit}>
          <p className="text-sm text-gray-600 mb-4">
            Enter your city and we'll find matches in your area.
          </p>
          <input
            type="text"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            placeholder="e.g., San Francisco, CA"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 mb-3"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !manualAddress.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Setting Location...
              </span>
            ) : (
              'Set Location'
            )}
          </button>
        </form>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Privacy:</strong> Your exact location is never shared. We only show your distance to other users.
        </p>
      </div>
    </div>
  );
}
