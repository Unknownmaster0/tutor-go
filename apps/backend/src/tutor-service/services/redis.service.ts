import { redisClient } from '../../shared/redis';

export class RedisService {
  // Cache search results
  async cacheSearchResults(key: string, data: any, ttl: number = 300): Promise<void> {
    await redisClient.set(key, data, { ttl, prefix: 'tutor:' });
  }

  async getCachedSearchResults(key: string): Promise<any | null> {
    return await redisClient.get(key, { prefix: 'tutor:' });
  }

  // Generate cache key for search
  generateSearchCacheKey(params: any): string {
    const { latitude, longitude, radius, subject, minRate, maxRate, minRating } = params;
    // Round coordinates to 4 decimal places for better cache hits
    const lat = Math.round(latitude * 10000) / 10000;
    const lon = Math.round(longitude * 10000) / 10000;
    return `search:${lat}:${lon}:${radius}:${subject || 'all'}:${minRate || 0}:${maxRate || 'max'}:${minRating || 0}`;
  }

  // Invalidate tutor-related cache when profile is updated
  async invalidateTutorCache(tutorId: string): Promise<void> {
    // Invalidate all search caches (since tutor data changed)
    await redisClient.invalidateCache('search:*');
    
    // Invalidate specific tutor profile cache
    await redisClient.del(`profile:${tutorId}`, { prefix: 'tutor:' });
  }

  // Invalidate all search caches
  async invalidateSearchCache(): Promise<void> {
    await redisClient.invalidateCache('search:*');
  }
}
