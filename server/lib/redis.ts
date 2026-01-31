import { createClient, type RedisClientType } from 'redis';
import logger from './logger.js';
import { validatedEnv } from './env.js';

const hasRedisConfig = Boolean(
  validatedEnv.REDIS_URL ||
  validatedEnv.REDIS_HOST ||
  validatedEnv.REDIS_PORT
);

let redisClient: RedisClientType | null = null;

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
    socket,
    password: validatedEnv.REDIS_PASSWORD || undefined
  });

  client.on('error', (err) => {
    logger.error('Redis client error', { error: err.message });
  });

  client.on('reconnecting', () => {
    logger.warn('Redis client reconnecting');
  });

  client.on('ready', () => {
    logger.info('Redis client ready');
  });

  client
    .connect()
    .catch((err) => {
      logger.error('Redis connection failed', { error: err.message });
    });

  return client;
};

redisClient = createRedisClient();

export const isRedisEnabled = () => Boolean(redisClient);
export default redisClient;
