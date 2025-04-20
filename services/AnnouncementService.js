// ptilms-api/services/AnnouncementService.js
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors.js';
import { error as _error } from '../utils/logger.js';
import sequelize from '../config/sequelize.mjs';

class AnnouncementService {
  constructor({ announcementRepository, courseRepository, departmentRepository, levelRepository }) {
    this.announcementRepository = announcementRepository;
    this.courseRepository = courseRepository;
    this.departmentRepository = departmentRepository;
    this.levelRepository = levelRepository;
  }

  async getAllAnnouncements() {
    try {
      return await this.announcementRepository.getAllAnnouncements();
    } catch (error) {
      _error(`Error in getAllAnnouncements: ${error.message}`);
      throw error;
    }
  }

  async getAnnouncementById(announcementId) {
    try {
      const announcement = await this.announcementRepository.getAnnouncementById(announcementId);
      if (!announcement) {
        throw new NotFoundError('Announcement not found');
      }
      return announcement;
    } catch (error) {
      _error(`Error in getAnnouncementById: ${error.message}`);
      throw error;
    }
  }

  async createAnnouncement(title, content, departmentId, levelId, userId, courseId, userRole) {
    let transaction;
    try {
      transaction = await sequelize.transaction();

      if (!courseId) {
        throw new BadRequestError("Course ID is required for creating an announcement.");
      }

      if (!userId) {
        throw new BadRequestError("User ID is required for creating an announcement.");
      }

      // Check for existing announcement with the same title in the same course
      const existingAnnouncement = await this.announcementRepository.findExistingAnnouncement(title, courseId);
      if (existingAnnouncement) {
        throw new BadRequestError("An announcement with this title already exists in this course.");
      }

      // Get the course with its lecturer information
      const course = await this.courseRepository.getCourseWithLecturer(courseId);
      if (!course) {
        throw new NotFoundError("Course not found");
      }

      // Verify department exists if provided
      if (departmentId) {
        const department = await this.departmentRepository.getDepartmentById(departmentId);
        if (!department) {
          throw new NotFoundError("Department not found");
        }
      }

      // Verify level exists if provided
      if (levelId) {
        const level = await this.levelRepository.getLevelById(levelId);
        if (!level) {
          throw new NotFoundError("Level not found");
        }
      }

      // Authorization check: Allow admins or the course's lecturer
      if (userRole !== 'admin') {
        // Verify the user is the lecturer for this course
        if (!course.lecturerId || course.lecturerId !== userId) {
          throw new ForbiddenError("You can only create announcements for courses you teach");
        }
      }

      const announcement = await this.announcementRepository.createAnnouncement(
        {
          title,
          content,
          departmentId,
          levelId,
          userId,
          courseId
        },
        { transaction }
      );

      await transaction.commit();
      return announcement;
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
      _error(`Error in createAnnouncement: ${error.message}`);
      throw error;
    }
  }

  async updateAnnouncement(announcementId, data) {
    try {
      const announcement = await this.announcementRepository.updateAnnouncement(announcementId, data);
      if (!announcement) {
        throw new NotFoundError('Announcement not found');
      }
      return announcement;
    } catch (error) {
      _error(`Error in updateAnnouncement: ${error.message}`);
      throw error;
    }
  }

  async deleteAnnouncement(announcementId) {
    try {
      const success = await this.announcementRepository.deleteAnnouncement(announcementId);
      if (!success) {
        throw new NotFoundError('Announcement not found');
      }
    } catch (error) {
      _error(`Error in deleteAnnouncement: ${error.message}`);
      throw error;
    }
  }

  async getAnnouncementsByCourseId(courseId) {
    try {
      return await this.announcementRepository.getAnnouncementsByCourseId(courseId);
    } catch (error) {
      _error(`Error in getAnnouncementsByCourseId: ${error.message}`);
      throw error;
    }
  }

  async getAnnouncementsByLecturerId(lecturerId) {
    try {
      return await this.announcementRepository.getAnnouncementsByLecturerId(lecturerId);
    } catch (error) {
      _error(`Error in getAnnouncementsByLecturerId: ${error.message}`);
      throw error;
    }
  }
}

export default AnnouncementService;