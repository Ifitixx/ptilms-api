// ptilms-api/routes/chats.js
import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';
import { validate, validationSchemas } from '../middlewares/validationMiddleware.js';
import { body, param } from 'express-validator';
import { ROLES } from '../config/constants.mjs';
const router = Router();

export default (chatController) => {
  // Both admins and lecturers can create chats
  router.post('/', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER]),
    validate([
      body('name').trim().notEmpty().withMessage('Name is required'),
      body('communicationType').trim().notEmpty().withMessage('Communication type is required')
        .isIn(['group', 'private']).withMessage('Communication type must be either group or private')
    ]),
    (req, res, next) => chatController.createChat(req, res, next)
  );

  // Get chats by course ID (must be before /:id route)
  router.get('/course/:courseId',
    authenticateToken,
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER, ROLES.STUDENT]),
    validate([
      param('courseId').isUUID().withMessage('Invalid courseId format')
    ]),
    (req, res, next) => chatController.getChatsByCourseId(req, res, next)
  );

  // Get chats by user ID (must be before /:id route)
  router.get('/user/:userId',
    authenticateToken,
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER, ROLES.STUDENT]),
    validate([
      param('userId').isUUID().withMessage('Invalid userId format')
    ]),
    (req, res, next) => chatController.getChatsByUserId(req, res, next)
  );

  // Both admins and lecturers can get all chats
  router.get('/', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER]),
    (req, res, next) => chatController.getAllChats(req, res, next)
  );

  // Get specific chat by ID
  router.get('/:id', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER]),
    validate([
      param('id').isUUID().withMessage('Invalid chat ID format')
    ]),
    (req, res, next) => chatController.getChatById(req, res, next)
  );

  // Update chat
  router.put('/:id', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER]),
    validate([
      param('id').isUUID().withMessage('Invalid chat ID format'),
      body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
      body('communicationType').optional().isIn(['group', 'private'])
        .withMessage('Communication type must be either group or private')
    ]),
    (req, res, next) => chatController.updateChat(req, res, next)
  );

  // Only admins can delete chats
  router.delete('/:id', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN]),
    validate([
      param('id').isUUID().withMessage('Invalid chat ID format')
    ]),
    (req, res, next) => chatController.deleteChat(req, res, next)
  );

  return router;
};