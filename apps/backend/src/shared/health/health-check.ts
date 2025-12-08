import { Request, Response } from 'express';

/**
 * Health check endpoint for Docker health checks and monitoring
 */
export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: process.env.SERVICE_NAME || 'unknown',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };

  res.status(200).json(healthStatus);
};

/**
 * Readiness check - verifies service dependencies are available
 */
export const readinessCheck = async (
  req: Request,
  res: Response,
  dependencies: Array<() => Promise<boolean>>
): Promise<void> => {
  try {
    const results = await Promise.all(
      dependencies.map(async (check) => {
        try {
          return await check();
        } catch {
          return false;
        }
      })
    );

    const allReady = results.every((result) => result === true);

    if (allReady) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        dependencies: 'all connected',
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        dependencies: 'some dependencies unavailable',
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
