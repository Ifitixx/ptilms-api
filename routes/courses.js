// ptilms-api/routes/courses.js
import express from 'express';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';
import { validate, validationSchemas } from '../middlewares/validationMiddleware.js';
import cacheMiddleware from '../middlewares/cacheMiddleware.js';
import rateLimiter from '../middlewares/rateLimiter.js';
import { ROLES } from '../config/constants.mjs';

const createCourseRoutes = (courseController) => {
  const router = express.Router();
  const { courseCreationLimiter } = rateLimiter;

  // List all courses (cached for 1 hour)
  router.get('/',
    authenticateToken,
    cacheMiddleware('courses', 3600),
    (req, res, next) => courseController.getAllCourses(req, res, next)
  );

  // Get single course (cached for 1 hour)
  router.get('/:courseId',
    authenticateToken,
    cacheMiddleware('course', 3600),
    (req, res, next) => courseController.getCourseById(req, res, next)
  );

  // Create course (instructors and admins only)
  router.post('/',
    authenticateToken,
    authorizeRole([ROLES.INSTRUCTOR, ROLES.ADMIN]),
    courseCreationLimiter,
    validate(validationSchemas.createCourse),
    (req, res, next) => courseController.createCourse(req, res, next)
  );

  // Update course (instructors and admins only)
  router.put('/:courseId',
    authenticateToken,
    authorizeRole([ROLES.INSTRUCTOR, ROLES.ADMIN]),
    validate(validationSchemas.createCourse),
    (req, res, next) => courseController.updateCourse(req, res, next)
  );

  // Delete course (admins only)
  router.delete('/:courseId',
    authenticateToken,
    authorizeRole([ROLES.ADMIN]),
    (req, res, next) => courseController.deleteCourse(req, res, next)
  );

  // Get course materials (cached for 30 minutes)
  router.get('/:courseId/materials',
    authenticateToken,
    cacheMiddleware('course-materials', 1800),
    (req, res, next) => courseController.getCourseMaterials(req, res, next)
  );

  // Get course assignments (cached for 15 minutes)
  router.get('/:courseId/assignments',
    authenticateToken,
    cacheMiddleware('course-assignments', 900),
    (req, res, next) => courseController.getCourseAssignments(req, res, next)
  );

  return router;
};

export default createCourseRoutes;