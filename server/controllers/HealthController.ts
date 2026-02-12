import { Request, Response } from 'express';
import { prisma } from '../lib/db.js';
import redisClient from '../lib/redis.js';

export class HealthController {
  
  /**
   * Liveness probe - returns 200 if the process is up.
   * Does not check dependencies to avoid restarting during cascading failures.
   */
  static async liveness(req: Request, res: Response) {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  }

  /**
   * Readiness probe - checks if the service can actually handle requests.
   * Verifies Database and Redis connectivity.
   */
  static async readiness(req: Request, res: Response) {
    const status: any = {
      status: 'UP',
      timestamp: new Date().toISOString(),
      services: {
        database: 'UNKNOWN',
        redis: 'UNKNOWN'
      }
    };

    let statusCode = 200;

    // Check Database (Prisma)
    try {
      await prisma.$queryRaw`SELECT 1`;
      status.services.database = 'UP';
    } catch (error: any) {
      status.services.database = 'DOWN';
      status.errors = status.errors || [];
      status.errors.push(`Database error: ${error.message}`);
      statusCode = 503;
    }

    // Check Redis
    try {
      if (redisClient) {
        if (redisClient.isOpen) {
          await redisClient.ping();
          status.services.redis = 'UP';
        } else {
          status.services.redis = 'DOWN (Closed)';
        }
      } else {
         status.services.redis = 'DISABLED';
      }
    } catch (error: any) {
      status.services.redis = 'DOWN';
      status.errors = status.errors || [];
      status.errors.push(`Redis error: ${error.message}`);
      // connection failure to redis might not be critical depending on app logic, 
      // but for "Readiness" usually we want it UP if configured.
      if (process.env.REDIS_URL || process.env.REDIS_HOST) {
         statusCode = 503;
      }
    }

    if (statusCode !== 200) {
      status.status = 'DOWN';
    }

    res.status(statusCode).json(status);
  }
}
