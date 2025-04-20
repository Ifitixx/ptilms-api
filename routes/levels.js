// ptilms-api/routes/levels.js
import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';
import { validate, validationSchemas } from '../middlewares/validationMiddleware.js';
import { body, param } from 'express-validator';
import { ROLES } from '../config/constants.mjs';
const router = Router();

export default (levelController) => {
  // Both admins and lecturers can create levels
  router.post('/', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER]),
    validate([
      body('name').trim().notEmpty().withMessage('Name is required')
    ]),
    (req, res, next) => levelController.createLevel(req, res, next)
  );

  // Get levels by department ID (must be before /:id route)
  router.get('/department/:departmentId',
    authenticateToken,
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER, ROLES.STUDENT]),
    validate([
      param('departmentId').isUUID().withMessage('Invalid departmentId format')
    ]),
    (req, res, next) => levelController.getLevelsByDepartmentId(req, res, next)
  );

  // Both admins and lecturers can get all levels
  router.get('/', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER]),
    (req, res, next) => levelController.getAllLevels(req, res, next)
  );

  // Get specific level by ID
  router.get('/:id', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER]),
    validate([
      param('id').isUUID().withMessage('Invalid level ID format')
    ]),
    (req, res, next) => levelController.getLevelById(req, res, next)
  );

  // Update level
  router.put('/:id', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER]),
    validate([
      param('id').isUUID().withMessage('Invalid level ID format'),
      body('name').optional().trim().notEmpty().withMessage('Name cannot be empty')
    ]),
    (req, res, next) => levelController.updateLevel(req, res, next)
  );

  // Only admins can delete levels
  router.delete('/:id', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN]),
    validate([
      param('id').isUUID().withMessage('Invalid level ID format')
    ]),
    (req, res, next) => levelController.deleteLevel(req, res, next)
  );

  return router;
};