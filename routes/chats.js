// ptilms-api/routes/chats.js
import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
const { authenticateToken, authorizeRole, ROLES } = authMiddleware;
const router = Router();

export default ({ chatController }) => {
  // Both admins and lecturers can create chats
  router.post('/', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => chatController.createChat(req, res, next));

  // Only admins can delete chats
  router.delete('/:id', authenticateToken, authorizeRole([ROLES.ADMIN]), (req, res, next) => chatController.deleteChat(req, res, next));

  // Both admins and lecturers can get all chats
  router.get('/', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => chatController.getAllChats(req, res, next));

  // Both admins and lecturers can get a specific chat
  router.get('/:id', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => chatController.getChatById(req, res, next));

  // Both admins and lecturers can update a chat
  router.put('/:id', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => chatController.updateChat(req, res, next));

  return router;
};