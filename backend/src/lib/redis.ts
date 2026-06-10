import Redis from 'ioredis'
import { getRedisConnectionOptions } from './redisConnection'

export const redis = new Redis({
  ...getRedisConnectionOptions(),
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000),
  lazyConnect: true,
})

redis.on('connect', () => console.log('Redis connected'))
redis.on('error', (err) => console.error('Redis error:', err))

export async function connectRedis(): Promise<void> {
  if (redis.status === 'ready' || redis.status === 'connecting') return
  await redis.connect()
}
