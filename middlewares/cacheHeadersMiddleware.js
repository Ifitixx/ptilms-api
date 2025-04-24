// ptilms-api/cacheHeadersMiddleware.js
const setCacheHeaders = (duration) => {
  return (req, res, next) => {
    // Skip caching for authenticated requests
    if (req.headers.authorization) {
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return next();
    }

    // Set caching headers for public content
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', `public, max-age=${duration}`);
      res.setHeader('Expires', new Date(Date.now() + duration * 1000).toUTCString());
    } else {
      // Prevent caching for non-GET requests
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    next();
  };
};

// Cache durations for different types of content
export const cacheHeaders = {
  // Static assets (1 year)
  static: setCacheHeaders(365 * 24 * 60 * 60),
  
  // Public API responses (5 minutes)
  short: setCacheHeaders(5 * 60),
  
  // Semi-static data (1 hour)
  medium: setCacheHeaders(60 * 60),
  
  // Rarely changing data (1 day)
  long: setCacheHeaders(24 * 60 * 60)
};

export default cacheHeaders;