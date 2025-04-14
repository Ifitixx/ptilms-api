// ptilms-api/routes/announcements.js
import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
const { authenticateToken, authorizeRole, ROLES } = authMiddleware;
const router = Router();

export default (announcementController) => {
  // Both admins and lecturers can create announcements
  router.post('/', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => announcementController.createAnnouncement(req, res, next));

  // Only admins can delete announcements
  router.delete('/:id', authenticateToken, authorizeRole([ROLES.ADMIN]), (req, res, next) => announcementController.deleteAnnouncement(req, res, next));

  // Both admins and lecturers can get all announcements
  router.get('/', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => announcementController.getAllAnnouncements(req, res, next));

  // Both admins and lecturers can get a specific announcement
  router.get('/:id', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => announcementController.getAnnouncementById(req, res, next));

  // Both admins and lecturers can update an announcement
  router.put('/:id', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => announcementController.updateAnnouncement(req, res, next));

  // New route: Get announcements by course ID
  router.get('/course/:courseId', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER, ROLES.STUDENT]), (req, res, next) => announcementController.getAnnouncementsByCourseId(req, res, next));

  // New route: Get announcements by lecturer ID
  router.get('/lecturer/:lecturerId', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), (req, res, next) => announcementController.getAnnouncementsByLecturerId(req, res, next));

  return router;
};