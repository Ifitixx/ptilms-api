// ptilms-api/routes/rolePermissions.js
import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
const { authenticateToken, authorizeRole, ROLES } = authMiddleware;
const router = Router();

export default ({ rolePermissionController }) => {
  // Only admins can create role permissions
  router.post('/', authenticateToken, authorizeRole([ROLES.ADMIN]), (req, res, next) => rolePermissionController.createRolePermission(req, res, next));

  // Only admins can delete role permissions
  router.delete('/:id', authenticateToken, authorizeRole([ROLES.ADMIN]), (req, res, next) => rolePermissionController.deleteRolePermission(req, res, next));

  // Only admins can get all role permissions
  router.get('/', authenticateToken, authorizeRole([ROLES.ADMIN]), (req, res, next) => rolePermissionController.getAllRolePermissions(req, res, next));

  // Only admins can get a specific role permission
  router.get('/:id', authenticateToken, authorizeRole([ROLES.ADMIN]), (req, res, next) => rolePermissionController.getRolePermissionById(req, res, next));

  // Only admins can update a role permission
  router.put('/:id', authenticateToken, authorizeRole([ROLES.ADMIN]), (req, res, next) => rolePermissionController.updateRolePermission(req, res, next));

  // Only admins can get role permissions by role ID
  router.get('/role/:roleId', authenticateToken, authorizeRole([ROLES.ADMIN]), (req, res, next) => rolePermissionController.getRolePermissionsByRoleId(req, res, next));

  // Only admins can get role permissions by permission ID
  router.get('/permission/:permissionId', authenticateToken, authorizeRole([ROLES.ADMIN]), (req, res, next) => rolePermissionController.getRolePermissionsByPermissionId(req, res, next));

  return router;
};