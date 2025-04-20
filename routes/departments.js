// ptilms-api/routes/departments.js
import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';
import { validate, validationSchemas } from '../middlewares/validationMiddleware.js';
import { body, param } from 'express-validator';
import { ROLES } from '../config/constants.mjs';
const router = Router();

export default (departmentController) => {
  // Both admins and lecturers can create departments
  router.post('/', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER]),
    validate([
      body('name').trim().notEmpty().withMessage('Name is required'),
      body('code').trim().notEmpty().withMessage('Code is required')
    ]),
    (req, res, next) => departmentController.createDepartment(req, res, next)
  );

  // Get departments by course ID (must be before /:id route)
  router.get('/course/:courseId',
    authenticateToken,
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER, ROLES.STUDENT]),
    validate([
      param('courseId').isUUID().withMessage('Invalid courseId format')
    ]),
    (req, res, next) => departmentController.getDepartmentsByCourseId(req, res, next)
  );

  // Both admins and lecturers can get all departments
  router.get('/', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER]),
    (req, res, next) => departmentController.getAllDepartments(req, res, next)
  );

  // Get specific department by ID
  router.get('/:id', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER]),
    validate([
      param('id').isUUID().withMessage('Invalid department ID format')
    ]),
    (req, res, next) => departmentController.getDepartmentById(req, res, next)
  );

  // Update department
  router.put('/:id', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER]),
    validate([
      param('id').isUUID().withMessage('Invalid department ID format'),
      body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
      body('code').optional().trim().notEmpty().withMessage('Code cannot be empty')
    ]),
    (req, res, next) => departmentController.updateDepartment(req, res, next)
  );

  // Only admins can delete departments
  router.delete('/:id', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN]),
    validate([
      param('id').isUUID().withMessage('Invalid department ID format')
    ]),
    (req, res, next) => departmentController.deleteDepartment(req, res, next)
  );

  return router;
};