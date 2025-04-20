// ptilms-api/routes/chatMessages.js
import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';
import { validate, validationSchemas } from '../middlewares/validationMiddleware.js';
import { param } from 'express-validator';
import { ROLES } from '../config/constants.mjs';
const router = Router();

export default (chatMessageController) => {
  // Create chat message
  router.post('/', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER, ROLES.STUDENT]),
    validate(validationSchemas.createChatMessage),
    (req, res, next) => chatMessageController.createChatMessage(req, res, next)
  );

  // Get messages by chat ID (must be before /:id route)
  router.get('/chat/:chatId',
    authenticateToken,
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER, ROLES.STUDENT]),
    validate([
      param('chatId').isUUID().withMessage('Invalid chatId format')
    ]),
    (req, res, next) => chatMessageController.getChatMessagesByChatId(req, res, next)
  );

  // Get messages by user ID (must be before /:id route)
  router.get('/user/:userId',
    authenticateToken,
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER, ROLES.STUDENT]),
    validate([
      param('userId').isUUID().withMessage('Invalid userId format')
    ]),
    (req, res, next) => chatMessageController.getChatMessagesByUserId(req, res, next)
  );

  // Get all chat messages
  router.get('/', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER]),
    (req, res, next) => chatMessageController.getAllChatMessages(req, res, next)
  );

  // Get specific chat message by ID
  router.get('/:id', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER, ROLES.STUDENT]),
    validate([
      param('id').isUUID().withMessage('Invalid chat message ID format')
    ]),
    (req, res, next) => chatMessageController.getChatMessageById(req, res, next)
  );

  // Update chat message (only owner or admin)
  router.put('/:id', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER, ROLES.STUDENT]),
    validate([
      param('id').isUUID().withMessage('Invalid chat message ID format'),
      ...validationSchemas.updateChatMessage
    ]),
    (req, res, next) => chatMessageController.updateChatMessage(req, res, next)
  );

  // Only admins can delete chat messages
  router.delete('/:id', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN]),
    validate([
      param('id').isUUID().withMessage('Invalid chat message ID format')
    ]),
    (req, res, next) => chatMessageController.deleteChatMessage(req, res, next)
  );

  return router;
};