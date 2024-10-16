// Define the type for cache data
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

// The cache object to store data
const cache: Record<string, CacheEntry<any>> = {};

// Function to get data from the cache
export const getFromCache = <T>(key: string): T | null => {
  const cachedEntry = cache[key];

  if (cachedEntry) {
    const { data, expiry } = cachedEntry;

    // Check if the cached data is still valid
    if (expiry > Date.now()) {
      return data;
    } else {
      // If expired, remove it from the cache
      delete cache[key];
    }
  }
  console.log("Here is the cache", cache);

  return null;
};

// Function to set data in the cache
export const setToCache = <T>(
  key: string,
  data: T,
  ttl: number = 60000
): void => {
  const expiry = Date.now() + ttl; // ttl (Time To Live) is in milliseconds
  cache[key] = { data, expiry };
};
