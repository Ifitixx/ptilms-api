// ptilms-api/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
const { verify } = jwt;
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { isBlacklisted } from '../utils/tokenBlacklist.js';
import config from '../config/config.cjs';
const { jwt: _jwt } = config;
import { ROLES } from '../config/constants.mjs';

const authenticateToken = async (req, res, next) => {
  console.log('authenticateToken - Request (before):', {
    method: req.method,
    url: req.url,
    path: req.path,
    params: req.params,
    query: req.query,
  });
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log(`Received token: ${token}`);

  if (!token) {
    return next(new UnauthorizedError('No token provided'));
  }

  if (await isBlacklisted(token)) {
    return next(new UnauthorizedError('Token has been revoked'));
  }

  try {
    const decoded = await verify(token, _jwt.secret);
    req.user = decoded;
    next();
  } catch (err) {
    next(new UnauthorizedError('Invalid token'));
  }

  console.log('authenticateToken - Request (after):', {
    method: req.method,
    url: req.url,
    path: req.path,
    params: req.params,
    query: req.query,
    user: req.user,
  });
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const errorMessage = "You do not have permission to perform this action.";
      console.log(`Authorization failed: User role '${req.user?.role}' does not match required roles [${roles.join(', ')}] for ${req.method} ${req.url}`);
      return next(new ForbiddenError(errorMessage));
    }
    next();
  };
};

export default { authenticateToken, authorizeRole, ROLES };