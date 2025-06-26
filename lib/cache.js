const CACHE_KEY = 'kfc_issues_cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5分钟缓存过期

export class IssuesCache {
  static getCache() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > CACHE_EXPIRY) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  static setCache(issues) {
    try {
      const cacheData = {
        data: issues,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error writing to cache:', error);
    }
  }

  static clearCache() {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}