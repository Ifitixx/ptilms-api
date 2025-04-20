// ptilms-api/routes/permissions.js
import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';
import { validate, validationSchemas } from '../middlewares/validationMiddleware.js';
import { body, param } from 'express-validator';
import { ROLES } from '../config/constants.mjs';
const router = Router();

export default (permissionController) => {
  // Only admins can create permissions
  router.post('/', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN]),
    validate([
      body('name').trim().notEmpty().withMessage('Name is required'),
      body('description').trim().notEmpty().withMessage('Description is required')
    ]),
    (req, res, next) => permissionController.createPermission(req, res, next)
  );

  // Get permissions by role ID (must be before /:id route)
  router.get('/role/:roleId',
    authenticateToken,
    authorizeRole([ROLES.ADMIN]),
    validate([
      param('roleId').isUUID().withMessage('Invalid roleId format')
    ]),
    (req, res, next) => permissionController.getPermissionsByRoleId(req, res, next)
  );

  // Only admins can get all permissions
  router.get('/', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN]),
    (req, res, next) => permissionController.getAllPermissions(req, res, next)
  );

  // Get specific permission by ID
  router.get('/:id', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN]),
    validate([
      param('id').isUUID().withMessage('Invalid permission ID format')
    ]),
    (req, res, next) => permissionController.getPermissionById(req, res, next)
  );

  // Update permission
  router.put('/:id', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN]),
    validate([
      param('id').isUUID().withMessage('Invalid permission ID format'),
      body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
      body('description').optional().trim().notEmpty().withMessage('Description cannot be empty')
    ]),
    (req, res, next) => permissionController.updatePermission(req, res, next)
  );

  // Only admins can delete permissions
  router.delete('/:id', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN]),
    validate([
      param('id').isUUID().withMessage('Invalid permission ID format')
    ]),
    (req, res, next) => permissionController.deletePermission(req, res, next)
  );

  return router;
};