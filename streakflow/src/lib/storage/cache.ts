import { storage } from './localStorage';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const entry = await storage.get<CacheEntry<T>>(`cache:${key}`);
    
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      // Cache expired
      await storage.remove(`cache:${key}`);
      return null;
    }
    
    return entry.data;
  },

  async set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    
    await storage.set(`cache:${key}`, entry);
  },

  async remove(key: string): Promise<void> {
    await storage.remove(`cache:${key}`);
  },

  async clear(): Promise<void> {
    // Note: This would need getAllKeys method to work properly
    // For now, we'll just log that cache should be cleared
    console.log('Cache clear requested');
  },
};

