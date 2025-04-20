// ptilms-api/routes/rolePermissions.js
import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';
import { validate, validationSchemas } from '../middlewares/validationMiddleware.js';
import { body, param } from 'express-validator';
import { ROLES } from '../config/constants.mjs';
const router = Router();

export default (rolePermissionController) => {
  // Only admins can create role permissions
  router.post('/', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN]),
    validate([
      body('roleId').trim().notEmpty().withMessage('RoleId is required').isUUID().withMessage('Invalid roleId format'),
      body('permissionId').trim().notEmpty().withMessage('PermissionId is required').isUUID().withMessage('Invalid permissionId format')
    ]),
    (req, res, next) => rolePermissionController.createRolePermission(req, res, next)
  );

  // Get role permissions by role ID (must be before /:id route)
  router.get('/role/:roleId',
    authenticateToken,
    authorizeRole([ROLES.ADMIN]),
    validate([
      param('roleId').isUUID().withMessage('Invalid roleId format')
    ]),
    (req, res, next) => rolePermissionController.getRolePermissionsByRoleId(req, res, next)
  );

  // Get role permissions by permission ID (must be before /:id route)
  router.get('/permission/:permissionId',
    authenticateToken,
    authorizeRole([ROLES.ADMIN]),
    validate([
      param('permissionId').isUUID().withMessage('Invalid permissionId format')
    ]),
    (req, res, next) => rolePermissionController.getRolePermissionsByPermissionId(req, res, next)
  );

  // Only admins can get all role permissions
  router.get('/', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN]),
    (req, res, next) => rolePermissionController.getAllRolePermissions(req, res, next)
  );

  // Get specific role permission by ID
  router.get('/:id', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN]),
    validate([
      param('id').isUUID().withMessage('Invalid role permission ID format')
    ]),
    (req, res, next) => rolePermissionController.getRolePermissionById(req, res, next)
  );

  // Update role permission
  router.put('/:id', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN]),
    validate([
      param('id').isUUID().withMessage('Invalid role permission ID format'),
      body('roleId').optional().isUUID().withMessage('Invalid roleId format'),
      body('permissionId').optional().isUUID().withMessage('Invalid permissionId format')
    ]),
    (req, res, next) => rolePermissionController.updateRolePermission(req, res, next)
  );

  // Only admins can delete role permissions
  router.delete('/:id', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN]),
    validate([
      param('id').isUUID().withMessage('Invalid role permission ID format')
    ]),
    (req, res, next) => rolePermissionController.deleteRolePermission(req, res, next)
  );

  return router;
};