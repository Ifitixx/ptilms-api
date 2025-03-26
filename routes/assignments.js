// ptilms-api/routes/assignments.js
import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
const { authenticateToken, authorizeRole, ROLES } = authMiddleware;
const router = Router();

export default ({ assignmentController }) => {
  // Both admins and lecturers can create assignments
  router.post('/', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => assignmentController.createAssignment(req, res, next));

  // Only admins can delete assignments
  router.delete('/:id', authenticateToken, authorizeRole([ROLES.ADMIN]), (req, res, next) => assignmentController.deleteAssignment(req, res, next));

  // Both admins and lecturers can get all assignments
  router.get('/', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => assignmentController.getAllAssignments(req, res, next));

  // Both admins and lecturers can get a specific assignment
  router.get('/:id', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => assignmentController.getAssignmentById(req, res, next));

  // Both admins and lecturers can update an assignment
  router.put('/:id', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => assignmentController.updateAssignment(req, res, next));

  return router;
};