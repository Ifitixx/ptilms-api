// ptilms-api/routes/departments.js
import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
const { authenticateToken, authorizeRole, ROLES } = authMiddleware;
const router = Router();

export default (departmentController) => {
  // Both admins and lecturers can create departments
  router.post('/', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => departmentController.createDepartment(req, res, next));

  // Only admins can delete departments
  router.delete('/:id', authenticateToken, authorizeRole([ROLES.ADMIN]), (req, res, next) => departmentController.deleteDepartment(req, res, next));

  // Both admins and lecturers can get all departments
  router.get('/', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => departmentController.getAllDepartments(req, res, next));

  // Both admins and lecturers can get a specific department
  router.get('/:id', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => departmentController.getDepartmentById(req, res, next));

  // Both admins and lecturers can update a department
  router.put('/:id', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => departmentController.updateDepartment(req, res, next));

  return router;
};