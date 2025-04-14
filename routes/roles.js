// ptilms-api/routes/roles.js
import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
const { authenticateToken, authorizeRole, ROLES } = authMiddleware;
const router = Router();

export default (roleController) => {
  // Only admins can create roles
  router.post('/', authenticateToken, authorizeRole([ROLES.ADMIN]), (req, res, next) => roleController.createRole(req, res, next));
  // Only admins can delete roles
  router.delete('/:id', authenticateToken, authorizeRole([ROLES.ADMIN]), (req, res, next) => roleController.deleteRole(req, res, next));
  // Only admins can get all roles
  router.get('/', authenticateToken, authorizeRole([ROLES.ADMIN]), (req, res, next) => roleController.getAllRoles(req, res, next));
  // Only admins can get a specific role
  router.get('/:id', authenticateToken, authorizeRole([ROLES.ADMIN]), (req, res, next) => roleController.getRoleById(req, res, next));
  // Only admins can update a role
  router.put('/:id', authenticateToken, authorizeRole([ROLES.ADMIN]), (req, res, next) => roleController.updateRole(req, res, next));
  return router;
};