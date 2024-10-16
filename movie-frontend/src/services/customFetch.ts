import { getFromCache, setToCache } from "./cache";

// Define a generic type for the custom fetch function
export const customFetcher = async <T>(
  url: string,
  options: RequestInit = {},
  ttl: number = 60000
): Promise<T> => {
  // Check if the data is already in the cache
  const cachedData = getFromCache<T>(url);
  if (cachedData) {
    return cachedData;
  }

  // Fetch data from the API
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}: ${response.statusText}`);
  }

  const data: T = await response.json();

  // Store the data in the cache
  setToCache(url, data, ttl);

  return data;
};
