// ptilms-api/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
const { verify } = jwt;
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { isBlacklisted } from '../utils/tokenBlacklist.js';
import config from '../config/config.cjs';
const { jwt: _jwt } = config;
import { ROLES } from '../config/constants.mjs';
import { models } from '../models/index.js';
import { info, error } from '../utils/logger.js';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    info(`Authentication failed: No token provided - ${req.method} ${req.path}`);
    return next(new UnauthorizedError('No token provided'));
  }

  if (await isBlacklisted(token)) {
    info(`Authentication failed: Token revoked - ${req.method} ${req.path}`);
    return next(new UnauthorizedError('Token has been revoked'));
  }

  try {
    const decoded = await verify(token, _jwt.secret);
    req.user = decoded;
    next();
  } catch (err) {
    error(`Authentication error: ${err.message} - ${req.method} ${req.path}`);
    next(new UnauthorizedError('Invalid token'));
  }
};

const authorizeRole = (roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      info(`Authorization failed: No user context - ${req.method} ${req.path}`);
      return next(new ForbiddenError("You do not have permission to perform this action."));
    }

    try {
      const user = await models.User.findByPk(req.user.userId, {
        include: [{ model: models.Role, as: 'role' }],
      });

      if (!user || !user.role) {
        info(`Authorization failed: User or role not found - User ID: ${req.user.userId}`);
        return next(new ForbiddenError("You do not have permission to perform this action."));
      }

      if (!roles.includes(user.role.name)) {
        info(`Authorization failed: Invalid role - User: ${user.id}, Role: ${user.role.name}, Required: [${roles.join(', ')}]`);
        return next(new ForbiddenError("You do not have permission to perform this action."));
      }

      next();
    } catch (err) {
      error(`Authorization error: ${err.message} - ${req.method} ${req.path}`);
      return next(new ForbiddenError("You do not have permission to perform this action."));
    }
  };
};

// Export both the middleware functions and ROLES object
export { authenticateToken, authorizeRole, ROLES };