// ptilms-api/routes/users.js
import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';
import { validate, validationSchemas } from '../middlewares/validationMiddleware.js';
import { body, param, query } from 'express-validator';
import { ROLES } from '../config/constants.mjs';
const router = Router();

export default (userController) => {
  /**
   * @swagger
   * /users/modified:
   *   get:
   *     summary: Get modified users since a specific date
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: since
   *         schema:
   *           type: string
   *           format: date-time
   *         required: false
   *         description: Date and time to filter modified users
   *     responses:
   *       200:
   *         description: Modified users found
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/modified',
    authenticateToken,
    authorizeRole([ROLES.ADMIN]),
    validate([
      query('since').optional().isISO8601().withMessage('Invalid date format for "since" parameter'),
    ]),
    (req, res, next) => userController.getModifiedUsers(req, res, next)
  );

  /**
   * @swagger
   * /users/role/{role}:
   *   get:
   *     summary: Get users by role
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: role
   *         schema:
   *           type: string
   *         required: true
   *         description: Role of the users
   *     responses:
   *       200:
   *         description: Users found
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       500:
   *         description: Internal server error
   */
  router.get('/role/:role',
    authenticateToken,
    authorizeRole([ROLES.ADMIN]),
    validate([
      param('role').isIn(Object.values(ROLES)).withMessage('Invalid role')
    ]),
    (req, res, next) => userController.getUsersByRole(req, res, next)
  );

  /**
   * @swagger
   * /users/department/{departmentId}:
   *   get:
   *     summary: Get users by department ID
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: departmentId
   *         schema:
   *           type: string
   *         required: true
   *         description: Department ID
   *     responses:
   *       200:
   *         description: Users found
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       500:
   *         description: Internal server error
   */
  router.get('/department/:departmentId',
    authenticateToken,
    authorizeRole([ROLES.ADMIN]),
    validate([
      param('departmentId').isUUID().withMessage('Invalid departmentId format')
    ]),
    (req, res, next) => userController.getUsersByDepartment(req, res, next)
  );

  /**
   * @swagger
   * /users:
   *   get:
   *     summary: Get all users
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Users found
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       500:
   *         description: Internal server error
   */
  router.get('/',
    authenticateToken,
    authorizeRole([ROLES.ADMIN]),
    (req, res, next) => userController.getAllUsers(req, res, next)
  );

  /**
   * @swagger
   * /users/profile:
   *   get:
   *     summary: Get user profile
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User profile found
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       500:
   *         description: Internal server error
   */
  router.get('/profile',
    authenticateToken,
    (req, res, next) => userController.getUserProfile(req, res, next)
  );

  /**
   * @swagger
   * /users/{userId}:
   *   get:
   *     summary: Get user by ID
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the user
   *     responses:
   *       200:
   *         description: User found
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  router.get('/:userId',
    authenticateToken,
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER, ROLES.STUDENT]),
    validate([
      param('userId').isUUID().withMessage('Invalid user ID format')
    ]),
    (req, res, next) => userController.getUserById(req, res, next)
  );

  /**
   * @swagger
   * /users/{userId}:
   *   put:
   *     summary: Update user by ID
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *               email:
   *                 type: string
   *               role:
   *                 type: string
   *     responses:
   *       200:
   *         description: User updated successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  router.put('/:userId',
    authenticateToken,
    authorizeRole([ROLES.ADMIN]),
    validate([
      param('userId').isUUID().withMessage('Invalid user ID format'),
      body('username').optional().trim().notEmpty().withMessage('Username cannot be empty')
        .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
      body('email').optional().trim().notEmpty().withMessage('Email cannot be empty')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
      body('role').optional().isIn(Object.values(ROLES)).withMessage('Invalid role')
    ]),
    (req, res, next) => userController.updateUser(req, res, next)
  );

  /**
   * @swagger
   * /users/{userId}/change-password:
   *   post:
   *     summary: Change user password
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               currentPassword:
   *                 type: string
   *               newPassword:
   *                 type: string
   *     responses:
   *       200:
   *         description: Password changed successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  router.post('/:userId/change-password',
    authenticateToken,
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER, ROLES.STUDENT]),
    validate([
      param('userId').isUUID().withMessage('Invalid user ID format'),
      body('currentPassword').trim().notEmpty().withMessage('Current password is required'),
      body('newPassword').trim().notEmpty().withMessage('New password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    ]),
    (req, res, next) => userController.changePassword(req, res, next)
  );

  /**
   * @swagger
   * /users/{userId}:
   *   delete:
   *     summary: Delete user by ID
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the user
   *     responses:
   *       204:
   *         description: User deleted successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  router.delete('/:userId',
    authenticateToken,
    authorizeRole([ROLES.ADMIN]),
    validate([
      param('userId').isUUID().withMessage('Invalid user ID format')
    ]),
    (req, res, next) => userController.deleteUser(req, res, next)
  );

  return router;
};