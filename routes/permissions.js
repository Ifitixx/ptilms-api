// ptilms-api/routes/permissions.js
import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
const { authenticateToken, authorizeRole, ROLES } = authMiddleware;
const router = Router();

export default (permissionController) => {
  // Only admins can create permissions
  router.post('/', authenticateToken, authorizeRole([ROLES.ADMIN]), (req, res, next) => permissionController.createPermission(req, res, next));

  // Only admins can delete permissions
  router.delete('/:id', authenticateToken, authorizeRole([ROLES.ADMIN]), (req, res, next) => permissionController.deletePermission(req, res, next));

  // Only admins can get all permissions
  router.get('/', authenticateToken, authorizeRole([ROLES.ADMIN]), (req, res, next) => permissionController.getAllPermissions(req, res, next));

  // Only admins can get a specific permission
  router.get('/:id', authenticateToken, authorizeRole([ROLES.ADMIN]), (req, res, next) => permissionController.getPermissionById(req, res, next));

  // Only admins can update a permission
  router.put('/:id', authenticateToken, authorizeRole([ROLES.ADMIN]), (req, res, next) => permissionController.updatePermission(req, res, next));

  return router;
};