import { Redis } from "ioredis";

const redis = new Redis(Bun.env.REDIS_URL || "redis://127.0.0.1:6379");

const fetch = async <T>(key: string, fetcher: () => T, expires: number) => {
  const existing = await get<T>(key);
  if (existing !== null) return existing;

  return set(key, fetcher, expires);
};

const get = async <T>(key: string): Promise<T> => {
  //   console.log("GET: " + key);
  const value = await redis.get(key);
  if (value === null) return null as any;

  return JSON.parse(value);
};

const set = async <T>(key: string, data: T, expires: number) => {
  //   console.log(`SET: ${key}, EXP: ${expires}`);
  await redis.set(key, JSON.stringify(data), "EX", expires);
  return data;
};

const del = async (key: string) => {
  await redis.del(key);
};

export default { fetch, set, get, del };
