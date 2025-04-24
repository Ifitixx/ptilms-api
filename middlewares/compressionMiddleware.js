// ptilms-api/compressionMiddleware.js
import compression from 'compression';

const shouldCompress = (req, res) => {
  // Don't compress responses for browsers that don't support it
  if (req.headers['x-no-compression']) {
    return false;
  }

  // Skip compressing already compressed formats
  const contentType = res.getHeader('Content-Type') || '';
  if (contentType.includes('image/') || 
      contentType.includes('video/') || 
      contentType.includes('audio/')) {
    return false;
  }

  // Use compression for everything else
  return compression.filter(req, res);
};

const compressionMiddleware = compression({
  filter: shouldCompress,
  // Set compression level (0-9, where 9 is maximum compression)
  level: 6,
  // Only compress responses above 1kb
  threshold: 1024,
  // Compress using both gzip and deflate
  encodings: ['gzip', 'deflate']
});

export default compressionMiddleware;