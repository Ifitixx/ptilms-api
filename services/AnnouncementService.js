// ptilms-api/services/AnnouncementService.js
import { NotFoundError } from '../utils/errors.js';
import { error as _error } from '../utils/logger.js';

class AnnouncementService {
  constructor({ announcementRepository }) {
    this.announcementRepository = announcementRepository;
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

  async createAnnouncement(data) {
    try {
      return await this.announcementRepository.createAnnouncement(data);
    } catch (error) {
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