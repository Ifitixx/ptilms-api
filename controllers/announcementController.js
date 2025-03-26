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
      const { announcementId } = req.params;
      // Validate announcementId format
      if (!validator.isUUID(announcementId)) {
        throw new ValidationError([{ field: 'announcementId', message: 'Invalid announcementId format' }]);
      }
      const announcement = await this.announcementService.getAnnouncementById(announcementId);
      if (!announcement) {
        throw new AnnouncementNotFoundError();
      }
      res.json(announcement);
    } catch (error) {
      next(error);
    }
  }

  async getAnnouncementsByCourseId(req, res, next) {
    try {
      const { courseId } = req.params;
      // Validate courseId format
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
      // Validate lecturerId format
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
      const { title, content, departmentId, levelId } = req.body;
      if (!title || !content || !departmentId || !levelId) {
        throw new BadRequestError('Title, content, departmentId, and levelId are required');
      }
      // Validate departmentId format
      if (!validator.isUUID(departmentId)) {
        throw new ValidationError([{ field: 'departmentId', message: 'Invalid departmentId format' }]);
      }
      // Validate levelId format
      if (!validator.isUUID(levelId)) {
        throw new ValidationError([{ field: 'levelId', message: 'Invalid levelId format' }]);
      }
      const announcement = await this.announcementService.createAnnouncement(req.body);
      res.status(201).json(announcement);
    } catch (error) {
      next(error);
    }
  }

  async updateAnnouncement(req, res, next) {
    try {
      const { announcementId } = req.params;
      // Validate announcementId format
      if (!validator.isUUID(announcementId)) {
        throw new ValidationError([{ field: 'announcementId', message: 'Invalid announcementId format' }]);
      }
      const announcement = await this.announcementService.updateAnnouncement(announcementId, req.body);
      if (!announcement) {
        throw new AnnouncementNotFoundError();
      }
      res.json(announcement);
    } catch (error) {
      next(error);
    }
  }

  async deleteAnnouncement(req, res, next) {
    try {
      const { announcementId } = req.params;
      // Validate announcementId format
      if (!validator.isUUID(announcementId)) {
        throw new ValidationError([{ field: 'announcementId', message: 'Invalid announcementId format' }]);
      }
      const announcement = await this.announcementService.getAnnouncementById(announcementId);
      if (!announcement) {
        throw new AnnouncementNotFoundError();
      }
      await this.announcementService.deleteAnnouncement(announcementId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default AnnouncementController;