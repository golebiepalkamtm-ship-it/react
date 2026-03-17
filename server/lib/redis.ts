import { createClient, type RedisClientType } from 'redis';
import logger from './logger.js';
import { validatedEnv } from './env.js';

// Check env vars for Redis config
const hasRedisConfig = Boolean(
  validatedEnv.REDIS_URL ||
  validatedEnv.REDIS_HOST ||
  validatedEnv.REDIS_PORT
);

let redisClient: any | null = null;
let isRedisReady = false;

const createRedisClient = () => {
  if (!hasRedisConfig) return null;

  const url = validatedEnv.REDIS_URL;
  const socket = url
    ? undefined
    : {
        host: validatedEnv.REDIS_HOST || '127.0.0.1',
        port: validatedEnv.REDIS_PORT || 6379
      };

  const client = createClient({
    url,
    socket: {
      ...socket,
    reconnectStrategy: (retries: number) => {
        if (retries > 5) {
          logger.warn('Redis connection retry limit reached. Continuing without Redis.');
          return false; // Return false to stop reconnecting instead of throwing
        }
        return Math.min(retries * 500, 5000);
      }
    },
    disableOfflineQueue: true, // Fail fast if Redis is down
    username: validatedEnv.REDIS_USERNAME,
    password: validatedEnv.REDIS_PASSWORD || undefined
  });

  // Handle uncaught errors to prevent process crash
  client.on('error', (err: Error) => {
    if (err.message.includes('ECONNREFUSED') || err.message.includes('ETIMEDOUT')) {
      logger.warn('Redis connection failed - moving to disabled state', { error: err.message });
    } else {
      logger.error('Redis client error', { error: err.message });
    }
    isRedisReady = false;
  });

  client.on('reconnecting', () => {
    logger.warn('Redis client reconnecting');
    isRedisReady = false;
  });

  client.on('ready', () => {
    logger.info('Redis client ready');
    isRedisReady = true;
  });

  client.on('end', () => {
    isRedisReady = false;
  });

  client
    .connect()
    .catch((err: Error) => {
      logger.warn('Redis connection failed - Redis features will be disabled', { error: err.message });
      isRedisReady = false;
    });

  return client;
};

redisClient = createRedisClient();

export const isRedisEnabled = () => Boolean(redisClient);
export const getRedisReady = () => isRedisReady;
export default redisClient;
