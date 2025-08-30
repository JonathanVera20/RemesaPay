import Redis from 'ioredis';
import config from './config';
import logger from '../utils/logger';

class RedisService {
  private client: Redis;
  private isConnected: boolean = false;

  constructor() {
    this.client = new Redis({
      host: this.parseRedisUrl(config.redis.url).host,
      port: this.parseRedisUrl(config.redis.url).port,
      password: config.redis.password,
      db: config.redis.db,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.setupEventHandlers();
  }

  private parseRedisUrl(url: string) {
    const urlParts = new URL(url);
    return {
      host: urlParts.hostname,
      port: parseInt(urlParts.port) || 6379,
    };
  }

  private setupEventHandlers() {
    this.client.on('connect', () => {
      logger.info('Redis connected');
      this.isConnected = true;
    });

    this.client.on('ready', () => {
      logger.info('Redis ready');
    });

    this.client.on('error', (error) => {
      logger.error('Redis error:', error);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      logger.warn('Redis connection closed');
      this.isConnected = false;
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis reconnecting...');
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.disconnect();
      this.isConnected = false;
    } catch (error) {
      logger.error('Failed to disconnect from Redis:', error);
    }
  }

  // Cache operations
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    try {
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, ttlSeconds);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXPIRE error for key ${key}:`, error);
      return false;
    }
  }

  // Hash operations
  async hset(key: string, field: string, value: string): Promise<boolean> {
    try {
      await this.client.hset(key, field, value);
      return true;
    } catch (error) {
      logger.error(`Redis HSET error for key ${key}:`, error);
      return false;
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.client.hget(key, field);
    } catch (error) {
      logger.error(`Redis HGET error for key ${key}:`, error);
      return null;
    }
  }

  async hgetall(key: string): Promise<Record<string, string> | null> {
    try {
      return await this.client.hgetall(key);
    } catch (error) {
      logger.error(`Redis HGETALL error for key ${key}:`, error);
      return null;
    }
  }

  // List operations
  async lpush(key: string, value: string): Promise<boolean> {
    try {
      await this.client.lpush(key, value);
      return true;
    } catch (error) {
      logger.error(`Redis LPUSH error for key ${key}:`, error);
      return false;
    }
  }

  async rpop(key: string): Promise<string | null> {
    try {
      return await this.client.rpop(key);
    } catch (error) {
      logger.error(`Redis RPOP error for key ${key}:`, error);
      return null;
    }
  }

  // Pub/Sub operations
  async publish(channel: string, message: string): Promise<boolean> {
    try {
      await this.client.publish(channel, message);
      return true;
    } catch (error) {
      logger.error(`Redis PUBLISH error for channel ${channel}:`, error);
      return false;
    }
  }

  subscribe(channel: string, callback: (message: string) => void): void {
    const subscriber = this.client.duplicate();
    subscriber.subscribe(channel);
    subscriber.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        callback(message);
      }
    });
  }

  // Rate limiting
  async isRateLimited(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    try {
      const current = await this.client.incr(key);
      if (current === 1) {
        await this.client.expire(key, windowSeconds);
      }
      return current > limit;
    } catch (error) {
      logger.error(`Redis rate limit check error for key ${key}:`, error);
      return false;
    }
  }

  // Session management
  async setSession(sessionId: string, data: object, ttlSeconds: number = 3600): Promise<boolean> {
    const key = `session:${sessionId}`;
    return await this.set(key, JSON.stringify(data), ttlSeconds);
  }

  async getSession(sessionId: string): Promise<object | null> {
    const key = `session:${sessionId}`;
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const key = `session:${sessionId}`;
    return await this.del(key);
  }

  // Lock implementation for concurrent operations
  async acquireLock(lockKey: string, ttlSeconds: number = 30): Promise<string | null> {
    const lockValue = `${Date.now()}-${Math.random()}`;
    const result = await this.client.set(lockKey, lockValue, 'EX', ttlSeconds, 'NX');
    return result === 'OK' ? lockValue : null;
  }

  async releaseLock(lockKey: string, lockValue: string): Promise<boolean> {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    const result = await this.client.eval(script, 1, lockKey, lockValue);
    return result === 1;
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis ping error:', error);
      return false;
    }
  }

  get connected(): boolean {
    return this.isConnected;
  }

  getClient(): Redis {
    return this.client;
  }
}

const redisService = new RedisService();

export default redisService;
