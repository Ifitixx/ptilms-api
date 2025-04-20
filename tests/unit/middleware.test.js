import { sequelize, models } from '../../models/index.js';
import jwt from 'jsonwebtoken';
import config from '../../config/config.cjs';
import { authenticateToken, authorizeRole } from '../../middlewares/authMiddleware.js';
import { UnauthorizedError, ForbiddenError } from '../../utils/errors.js';

describe('Middleware Tests', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
      user: null
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('authenticateToken', () => {
    it('should pass valid token', async () => {
      const token = jwt.sign({ userId: 1 }, config.jwt.secret);
      mockReq.headers.authorization = `Bearer ${token}`;

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.user).toBeDefined();
    });

    it('should reject missing token', async () => {
      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(UnauthorizedError)
      );
    });

    it('should reject invalid token', async () => {
      mockReq.headers.authorization = 'Bearer invalid.token.here';

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(UnauthorizedError)
      );
    });
  });

  describe('authorizeRole', () => {
    beforeEach(async () => {
      await sequelize.sync({ force: true });
      // Create test role
      await models.Role.create({
        id: 1,
        name: 'ADMIN',
        description: 'Administrator'
      });
    });

    it('should authorize user with correct role', async () => {
      mockReq.user = { userId: 1 };
      await models.User.create({
        id: 1,
        username: 'admin',
        email: 'admin@test.com',
        password: 'password123',
        roleId: 1
      });

      const middleware = authorizeRole(['ADMIN']);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject user with incorrect role', async () => {
      mockReq.user = { userId: 1 };
      await models.User.create({
        id: 1,
        username: 'user',
        email: 'user@test.com',
        password: 'password123',
        roleId: 1
      });

      const middleware = authorizeRole(['STUDENT']);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(ForbiddenError)
      );
    });
  });
});