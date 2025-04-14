// ptilms-api/routes/courseMaterials.js
import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
const { authenticateToken, authorizeRole, ROLES } = authMiddleware;
const router = Router();

export default (courseMaterialController) => {
  // Both admins and lecturers can create course materials
  router.post('/', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => courseMaterialController.createCourseMaterial(req, res, next));

  // Only admins can delete course materials
  router.delete('/:id', authenticateToken, authorizeRole([ROLES.ADMIN]), (req, res, next) => courseMaterialController.deleteCourseMaterial(req, res, next));

  // Both admins and lecturers can get all course materials
  router.get('/', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => courseMaterialController.getAllCourseMaterials(req, res, next));

  // Both admins and lecturers can get a specific course material
  router.get('/:id', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => courseMaterialController.getCourseMaterialById(req, res, next));

  // Both admins and lecturers can update a course material
  router.put('/:id', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => courseMaterialController.updateCourseMaterial(req, res, next));

  // Both admins and lecturers can get all course materials of a specific course
  router.get('/course/:courseId', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => courseMaterialController.getCourseMaterialsByCourseId(req, res, next));

  return router;
};