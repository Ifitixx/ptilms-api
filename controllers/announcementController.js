// ptilms-api/controllers/AnnouncementController.js
import {
  AnnouncementNotFoundError,
  BadRequestError,
  ValidationError,
} from '../utils/errors.js';
import validator from 'validator';

class AnnouncementController {
  constructor({ announcementService }) {
    this.announcementService = announcementService;
  }

  async getAllAnnouncements(req, res, next) {
    try {
      const announcements = await this.announcementService.getAllAnnouncements();
      res.json(announcements);
    } catch (error) {
      next(error);
    }
  }

  async getAnnouncementById(req, res, next) {
    try {
      const { id } = req.params;  // Changed from announcementId to id to match route parameter
      if (!validator.isUUID(id)) {
        throw new ValidationError([{ field: 'id', message: 'Invalid announcement ID format' }]);
      }
      const announcement = await this.announcementService.getAnnouncementById(id);
      if (!announcement) {
        throw new AnnouncementNotFoundError();
      }
      res.json({
        success: true,
        data: announcement
      });
    } catch (error) {
      next(error);
    }
  }

  async getAnnouncementsByCourseId(req, res, next) {
    try {
      const { courseId } = req.params;
      if (!validator.isUUID(courseId)) {
        throw new ValidationError([{ field: 'courseId', message: 'Invalid courseId format' }]);
      }
      const announcements = await this.announcementService.getAnnouncementsByCourseId(courseId);
      res.json(announcements);
    } catch (error) {
      next(error);
    }
  }

  async getAnnouncementsByLecturerId(req, res, next) {
    try {
      const { lecturerId } = req.params;
      if (!validator.isUUID(lecturerId)) {
        throw new ValidationError([{ field: 'lecturerId', message: 'Invalid lecturerId format' }]);
      }
      const announcements = await this.announcementService.getAnnouncementsByLecturerId(lecturerId);
      res.json(announcements);
    } catch (error) {
      next(error);
    }
  }

  async createAnnouncement(req, res, next) {
    try {
      const { title, content, departmentId, levelId, courseId } = req.body;
      const userId = req.user.userId; // Extract userId from the authenticated request
      const userRole = req.user.role; // Extract user role from the request

      if (!userId) {
        throw new BadRequestError('User ID is required');
      }

      const announcement = await this.announcementService.createAnnouncement(
        title,
        content,
        departmentId,
        levelId,
        userId,
        courseId,
        userRole // Pass the user role to the service
      );

      res.status(201).json({
        success: true,
        data: announcement
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAnnouncement(req, res, next) {
    try {
      const { id } = req.params;  // Changed from announcementId to id to match route parameter
      if (!validator.isUUID(id)) {
        throw new ValidationError([{ field: 'id', message: 'Invalid announcement ID format' }]);
      }
      const announcement = await this.announcementService.updateAnnouncement(id, req.body);
      if (!announcement) {
        throw new AnnouncementNotFoundError();
      }
      res.json({
        success: true,
        data: announcement
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAnnouncement(req, res, next) {
    try {
      const { id } = req.params;  // Changed from announcementId to id to match route parameter
      if (!validator.isUUID(id)) {
        throw new ValidationError([{ field: 'id', message: 'Invalid announcement ID format' }]);
      }
      const announcement = await this.announcementService.getAnnouncementById(id);
      if (!announcement) {
        throw new AnnouncementNotFoundError();
      }
      await this.announcementService.deleteAnnouncement(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default AnnouncementController;