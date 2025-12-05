export interface Coordinates {
  latitude: number;
  longitude: number;
}

export class GeocodingService {
  /**
   * Convert address to coordinates
   * In production, this would use a real geocoding API like Google Maps, Mapbox, or OpenStreetMap
   * For now, we'll use a mock implementation
   */
  async geocodeAddress(address: string): Promise<Coordinates> {
    // Mock implementation - returns coordinates for demonstration
    // In production, integrate with a real geocoding service
    
    // For testing purposes, we'll return mock coordinates based on address hash
    const hash = this.simpleHash(address);
    const latitude = 40.7128 + (hash % 100) / 100; // Around NYC
    const longitude = -74.0060 + (hash % 100) / 100;

    return {
      latitude,
      longitude,
    };
  }

  /**
   * Reverse geocode: convert coordinates to address
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    // Mock implementation
    return `Address at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}
