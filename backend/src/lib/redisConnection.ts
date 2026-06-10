import type { RedisOptions } from 'ioredis'

/** Shared ioredis / BullMQ connection settings (local Redis or Upstash TLS). */
export function getRedisConnectionOptions(): RedisOptions {
  const url = new URL(process.env.REDIS_URL!)
  const tls = url.protocol === 'rediss:' ? {} : undefined

  return {
    host: url.hostname,
    port: parseInt(url.port || '6379', 10),
    username: url.username || undefined,
    password: url.password || undefined,
    ...(tls ? { tls } : {}),
  }
}
