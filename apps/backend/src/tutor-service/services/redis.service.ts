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
    const { latitude, longitude, radius, subject, minRate, maxRate, minRating } = params || {};

    // If geo params aren't provided, use a 'nogeo' marker
    let latKey = 'nogeo';
    let lonKey = 'nogeo';
    let radiusKey = 'nogeo';

    if (latitude !== undefined && longitude !== undefined && radius !== undefined) {
      // Round coordinates to 4 decimal places for better cache hits
      latKey = (Math.round((latitude as number) * 10000) / 10000).toString();
      lonKey = (Math.round((longitude as number) * 10000) / 10000).toString();
      radiusKey = radius.toString();
    }

    return `search:${latKey}:${lonKey}:${radiusKey}:${subject || 'all'}:${minRate ?? 0}:${maxRate ?? 'max'}:${minRating ?? 0}`;
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
