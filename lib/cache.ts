import { AnalysisResult } from "./types";

interface CacheEntry {
  data: AnalysisResult;
  timestamp: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private defaultTTLMs = 60 * 60 * 1000; // 1 hour TTL

  public get(key: string): AnalysisResult | null {
    try {
      console.log(`[cache] Checking cache for key: ${key}`);
      const entry = this.cache.get(key.toLowerCase());
      if (!entry) {
        console.log(`[cache] Cache miss for key: ${key}`);
        return null;
      }

      if (Date.now() - entry.timestamp > this.defaultTTLMs) {
        console.log(`[cache] Cache expired for key: ${key}`);
        this.cache.delete(key.toLowerCase());
        return null;
      }

      console.log(`[cache] Cache hit for key: ${key}`);
      return entry.data;
    } catch (err) {
      console.log("[cache] Error reading from cache:", err);
      return null;
    }
  }

  public set(key: string, data: AnalysisResult): void {
    try {
      console.log(`[cache] Setting cache for key: ${key}`);
      this.cache.set(key.toLowerCase(), {
        data,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.log("[cache] Error writing to cache:", err);
    }
  }

  public clear(): void {
    try {
      console.log("[cache] Clearing all cache entries");
      this.cache.clear();
    } catch (err) {
      console.log("[cache] Error clearing cache:", err);
    }
  }
}

export const analysisCache = new MemoryCache();
