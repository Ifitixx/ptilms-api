// ptilms-api/routes/chatMessages.js
import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
const { authenticateToken, authorizeRole, ROLES } = authMiddleware;
const router = Router();

export default ({ chatMessageController }) => {
  // Both admins and lecturers can create chat messages
  router.post('/', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => chatMessageController.createChatMessage(req, res, next));

  // Only admins can delete chat messages
  router.delete('/:id', authenticateToken, authorizeRole([ROLES.ADMIN]), (req, res, next) => chatMessageController.deleteChatMessage(req, res, next));

  // Both admins and lecturers can get all chat messages
  router.get('/', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => chatMessageController.getAllChatMessages(req, res, next));

  // Both admins and lecturers can get a specific chat message
  router.get('/:id', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => chatMessageController.getChatMessageById(req, res, next));

  // Both admins and lecturers can update a chat message
  router.put('/:id', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => chatMessageController.updateChatMessage(req, res, next));

  return router;
};