import { createClient, type RedisClientType } from 'redis';
import logger from './logger.js';
import { validatedEnv } from './env.js';

// FORCE DISABLE REDIS to prevent connection loop errors on envs without actual Redis service
const hasRedisConfig = false; 
/*
const hasRedisConfig = Boolean(
  validatedEnv.REDIS_URL ||
  validatedEnv.REDIS_HOST ||
  validatedEnv.REDIS_PORT
);
*/

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
      reconnectStrategy: (retries) => {
        if (retries > 20) {
          logger.error('Redis connection retry exhausted. Giving up.');
          return new Error('Redis connection retry exhausted');
        }
        return Math.min(retries * 100, 3000);
      }
    },
    username: validatedEnv.REDIS_USERNAME,
    password: validatedEnv.REDIS_PASSWORD || undefined
  });

  client.on('error', (err) => {
    logger.error('Redis client error', { error: err.message });
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
    .catch((err) => {
      logger.error('Redis connection failed', { error: err.message });
      isRedisReady = false;
    });

  return client;
};

redisClient = createRedisClient();

export const isRedisEnabled = () => Boolean(redisClient);
export const getRedisReady = () => isRedisReady;
export default redisClient;
