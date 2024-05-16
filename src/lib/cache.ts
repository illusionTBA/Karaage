import type { Redis } from "ioredis";


const fetch = async <T>(redis: Redis, key: string, fetcher: () => T, expires: number) => {
  const existing = await get<T>(redis, key);
  if (existing !== null) return existing;

  return set(redis, key, fetcher, expires);
};

const get = async <T>(redis: Redis, key: string): Promise<T> => {
  //   console.log("GET: " + key);
  const value = await redis.get(key);
  if (value === null) return null as any;

  return JSON.parse(value);
};

const set = async <T>(redis: Redis, key: string, data: T, expires: number) => {
  //   console.log(`SET: ${key}, EXP: ${expires}`);
  await redis.set(key, JSON.stringify(data), "EX", expires);
  return data;
};

const del = async (redis: Redis, key: string) => {
  await redis.del(key);
};

export default { fetch, set, get, del };
