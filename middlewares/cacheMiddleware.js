// ptilms-api/cacheMiddleware.js
import CacheService from '../services/cacheService.js';

const cacheMiddleware = (prefix, duration = 3600) => {
  const cache = new CacheService();

  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from prefix and request params/query
    const key = cache.generateKey(prefix, `${req.originalUrl}:${JSON.stringify(req.query)}`);

    try {
      // Try to get from cache
      const cachedResponse = await cache.get(key);
      
      if (cachedResponse) {
        return res.json(cachedResponse);
      }

      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function(data) {
        if (res.statusCode === 200) {
          cache.set(key, data, duration);
        }
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      // If cache fails, continue without caching
      next();
    }
  };
};

export default cacheMiddleware;