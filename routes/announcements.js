// ptilms-api/routes/announcements.js
import express from 'express';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';
import { validate, validationSchemas } from '../middlewares/validationMiddleware.js';
import { body, param } from 'express-validator';
import { ROLES } from '../config/constants.mjs';

const createAnnouncementRoutes = (announcementController) => {
  const router = express.Router();

  // Both admins and lecturers can create announcements
  router.post('/', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER]),
    validate([
      body('title').trim().notEmpty().withMessage('Title is required'),
      body('content').trim().notEmpty().withMessage('Content is required'),
      body('courseId').trim().notEmpty().withMessage('CourseId is required').isUUID().withMessage('Invalid courseId format'),
      body('departmentId').optional().isUUID().withMessage('Invalid departmentId format'),
      body('levelId').optional().isUUID().withMessage('Invalid levelId format')
    ]),
    (req, res, next) => announcementController.createAnnouncement(req, res, next)
  );

  // Get announcements by course ID (must be before /:id route)
  router.get('/course/:courseId',
    authenticateToken,
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER, ROLES.STUDENT]),
    validate([
      param('courseId').isUUID().withMessage('Invalid courseId format')
    ]),
    (req, res, next) => announcementController.getAnnouncementsByCourseId(req, res, next)
  );

  // Get announcements by lecturer ID (must be before /:id route)
  router.get('/lecturer/:lecturerId', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER]),
    validate([
      param('lecturerId').isUUID().withMessage('Invalid lecturerId format')
    ]),
    (req, res, next) => announcementController.getAnnouncementsByLecturerId(req, res, next)
  );

  // Both admins and lecturers can get all announcements
  router.get('/', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER]),
    (req, res, next) => announcementController.getAllAnnouncements(req, res, next)
  );

  // Get specific announcement by ID
  router.get('/:id', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER]),
    validate([
      param('id').isUUID().withMessage('Invalid announcement ID format')
    ]),
    (req, res, next) => announcementController.getAnnouncementById(req, res, next)
  );

  // Update announcement
  router.put('/:id', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER]),
    validate([
      param('id').isUUID().withMessage('Invalid announcement ID format'),
      body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
      body('content').optional().trim().notEmpty().withMessage('Content cannot be empty')
    ]),
    (req, res, next) => announcementController.updateAnnouncement(req, res, next)
  );

  // Only admins can delete announcements
  router.delete('/:id', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN]),
    validate([
      param('id').isUUID().withMessage('Invalid announcement ID format')
    ]),
    (req, res, next) => announcementController.deleteAnnouncement(req, res, next)
  );

  return router;
};

export default createAnnouncementRoutes;