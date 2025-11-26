import { redisClient } from '../../shared/redis';

export class RedisService {
  private readonly REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds
  private readonly RESET_TOKEN_EXPIRY = 60 * 60; // 1 hour in seconds

  // Refresh Token Management
  async setRefreshToken(userId: string, token: string): Promise<void> {
    await redisClient.setSession(`refresh:${userId}`, token, {
      ttl: this.REFRESH_TOKEN_EXPIRY,
    });
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    return await redisClient.getSession<string>(`refresh:${userId}`);
  }

  async deleteRefreshToken(userId: string): Promise<void> {
    await redisClient.deleteSession(`refresh:${userId}`);
  }

  // Password Reset Token Management
  async setPasswordResetToken(userId: string, token: string): Promise<void> {
    // Store both userId -> token and token -> userId mappings
    await Promise.all([
      redisClient.set(`reset:user:${userId}`, token, { ttl: this.RESET_TOKEN_EXPIRY }),
      redisClient.set(`reset:token:${token}`, userId, { ttl: this.RESET_TOKEN_EXPIRY }),
    ]);
  }

  async getUserIdByResetToken(token: string): Promise<string | null> {
    return await redisClient.get<string>(`reset:token:${token}`);
  }

  async deletePasswordResetToken(userId: string): Promise<void> {
    const token = await redisClient.get<string>(`reset:user:${userId}`);
    
    if (token) {
      await Promise.all([
        redisClient.del(`reset:user:${userId}`),
        redisClient.del(`reset:token:${token}`),
      ]);
    }
  }

  // Token Revocation
  async revokeAllUserTokens(userId: string): Promise<void> {
    await redisClient.revokeUserSessions(userId);
  }
}
