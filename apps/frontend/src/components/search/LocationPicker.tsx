'use client';

import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

interface LocationPickerProps {
  onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void;
  isLoading?: boolean;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  isLoading = false,
}) => {
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Get user's current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setSelectedLocation({ latitude, longitude });

        // Reverse geocode to get address
        fetchAddressFromCoordinates(latitude, longitude);
      },
      (error) => {
        toast.error('Unable to get your location');
        console.error(error);
      },
    );
  };

  // Fetch address from coordinates using Google Geocoding API
  const fetchAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const formattedAddress = data.results[0].formatted_address;
        setAddress(formattedAddress);
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address: formattedAddress,
        });
      }
    } catch (err) {
      toast.error('Failed to fetch address');
      console.error(err);
    }
  };

  // Handle address input changes
  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);

    if (value.length > 3) {
      // Call Places Autocomplete API
      try {
        const response = await fetch(
          `/api/places/autocomplete?input=${encodeURIComponent(value)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
        );
        const data = await response.json();
        setSuggestions(data.predictions || []);
      } catch (err) {
        console.error('Autocomplete error:', err);
      }
    } else {
      setSuggestions([]);
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = async (suggestion: any) => {
    setAddress(suggestion.description);
    setSuggestions([]);

    // Get coordinates from place ID
    try {
      const response = await fetch(
        `/api/places/details?place_id=${suggestion.place_id}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
      );
      const data = await response.json();

      const location = data.result.geometry.location;
      setSelectedLocation({
        latitude: location.lat,
        longitude: location.lng,
      });

      onLocationSelect({
        latitude: location.lat,
        longitude: location.lng,
        address: suggestion.description,
      });
    } catch (err) {
      toast.error('Failed to get location details');
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Select Your Location</h3>

      <div className="space-y-3">
        {/* Address Input */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={handleAddressChange}
            placeholder="Enter your address"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />

          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.place_id}
                  type="button"
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0 transition"
                >
                  <p className="font-medium text-gray-900">{suggestion.main_text}</p>
                  <p className="text-sm text-gray-600">{suggestion.secondary_text}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Current Location Button */}
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLoading}
          className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition font-medium"
        >
          📍 Use Current Location
        </button>
      </div>

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900">Selected Location:</p>
          <p className="text-sm text-blue-700 mt-1">{address}</p>
          <p className="text-xs text-blue-600 mt-2">
            Coordinates: {selectedLocation.latitude.toFixed(4)},{' '}
            {selectedLocation.longitude.toFixed(4)}
          </p>
        </div>
      )}
    </div>
  );
};
