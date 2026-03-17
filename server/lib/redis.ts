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
        // Keep trying to reconnect in production, but with backoff
        // Max delay 10s
        return Math.min(retries * 500, 10000);
      },
      keepAlive: 5000,
      connectTimeout: 10000,
    },
    disableOfflineQueue: true,
    // Railway REDIS_URL usually contains credentials, don't override if URL is present
    username: url ? undefined : (validatedEnv.REDIS_USERNAME || 'default'),
    password: url ? undefined : (validatedEnv.REDIS_PASSWORD || undefined)
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
