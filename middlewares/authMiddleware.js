// ptilms-api/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
const { verify } = jwt;
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { isBlacklisted } from '../utils/tokenBlacklist.js';
import config from '../config/config.cjs'; // Correct: Default import
const { jwt: _jwt } = config; // Correct: Destructure after default import
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

  console.log(`Received token: ${token}`); // Add this line

  if (!token) {
    return next(new UnauthorizedError('No token provided'));
  }

  if (await isBlacklisted(token)) {
    return next(new UnauthorizedError('Token has been revoked'));
  }

  verify(token, _jwt.secret, (err, user) => {
    console.log(`JWT verification result: err=${err}, user=${JSON.stringify(user)}`); // Add this line
    if (err) {
      return next(new UnauthorizedError('Invalid token'));
    }
    req.user = user;
    next();
  });
  console.log('authenticateToken - Request (after):', {
    method: req.method,
    url: req.url,
    path: req.path,
    params: req.params,
    query: req.query,
    user: req.user, // If req.user is set
  });
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    next();
  };
};

export default { authenticateToken, authorizeRole, ROLES };