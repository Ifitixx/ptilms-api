// ptilms-api/routes/levels.js
import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
const { authenticateToken, authorizeRole, ROLES } = authMiddleware;
const router = Router();

export default (levelController) => {
  // Both admins and lecturers can create levels
  router.post('/', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => levelController.createLevel(req, res, next));

  // Only admins can delete levels
  router.delete('/:id', authenticateToken, authorizeRole([ROLES.ADMIN]), (req, res, next) => levelController.deleteLevel(req, res, next));

  // Both admins and lecturers can get all levels
  router.get('/', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => levelController.getAllLevels(req, res, next));

  // Both admins and lecturers can get a specific level
  router.get('/:id', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => levelController.getLevelById(req, res, next));

  // Both admins and lecturers can update a level
  router.put('/:id', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => levelController.updateLevel(req, res, next));

  return router;
};