// ptilms-api/routes/roles.js
import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';
import { validate, validationSchemas } from '../middlewares/validationMiddleware.js';
import { body, param } from 'express-validator';
import { ROLES } from '../config/constants.mjs';
const router = Router();

export default (roleController) => {
  // Only admins can create roles
  router.post('/', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN]),
    validate([
      body('name').trim().notEmpty().withMessage('Name is required'),
      body('description').trim().notEmpty().withMessage('Description is required')
    ]),
    (req, res, next) => roleController.createRole(req, res, next)
  );

  // Get roles by permission ID (must be before /:id route)
  router.get('/permission/:permissionId',
    authenticateToken,
    authorizeRole([ROLES.ADMIN]),
    validate([
      param('permissionId').isUUID().withMessage('Invalid permissionId format')
    ]),
    (req, res, next) => roleController.getRolesByPermissionId(req, res, next)
  );

  // Only admins can get all roles
  router.get('/', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN]),
    (req, res, next) => roleController.getAllRoles(req, res, next)
  );

  // Get specific role by ID
  router.get('/:id', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN]),
    validate([
      param('id').isUUID().withMessage('Invalid role ID format')
    ]),
    (req, res, next) => roleController.getRoleById(req, res, next)
  );

  // Update role
  router.put('/:id', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN]),
    validate([
      param('id').isUUID().withMessage('Invalid role ID format'),
      body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
      body('description').optional().trim().notEmpty().withMessage('Description cannot be empty')
    ]),
    (req, res, next) => roleController.updateRole(req, res, next)
  );

  // Only admins can delete roles
  router.delete('/:id', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN]),
    validate([
      param('id').isUUID().withMessage('Invalid role ID format')
    ]),
    (req, res, next) => roleController.deleteRole(req, res, next)
  );

  return router;
};