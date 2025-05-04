import { Redis } from "ioredis";

export async function tryAcquireRedisLock(
  redis: Redis,
  key: string,
  ttlSeconds = 60
): Promise<boolean> {
  const result = await redis.set(key, "1", "EX", ttlSeconds, "NX");
  return result === "OK";
}
