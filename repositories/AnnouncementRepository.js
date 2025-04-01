// ptilms-api/repositories/AnnouncementRepository.js
class AnnouncementRepository {
  constructor({ Announcement, User, Course, Department, Level }) { // Expect an object
    this.announcementModel = Announcement;
    this.userModel = User;
    this.courseModel = Course;
    this.departmentModel = Department;
    this.levelModel = Level;
  }

  async getAllAnnouncements() {
    return await this.announcementModel.findAll({
      include: [
        {
          model: this.userModel,
          as: 'lecturer',
        },
        {
          model: this.courseModel,
          as: 'course',
        },
      ],
    });
  }

  async getAnnouncementById(announcementId) {
    return await this.announcementModel.findByPk(announcementId, {
      include: [
        {
          model: this.userModel,
          as: 'lecturer',
        },
        {
          model: this.courseModel,
          as: 'course',
        },
      ],
    });
  }

  async createAnnouncement(data) {
    return await this.announcementModel.create(data);
  }

  async updateAnnouncement(announcementId, data) {
    const announcement = await this.announcementModel.findByPk(announcementId);
    if (!announcement) return null;
    return await announcement.update(data);
  }

  async deleteAnnouncement(announcementId) {
    const announcement = await this.announcementModel.findByPk(announcementId);
    if (!announcement) return false;
    await announcement.destroy();
    return true;
  }
  async getAnnouncementsByCourseId(courseId) {
    return await this.announcementModel.findAll({
      where: { courseId: courseId },
      include: [
        {
          model: this.userModel,
          as: 'lecturer',
        },
        {
          model: this.courseModel,
          as: 'course',
        },
      ],
    });
  }
  async getAnnouncementsByLecturerId(lecturerId) {
    return await this.announcementModel.findAll({
      where: { lecturerId: lecturerId },
      include: [
        {
          model: this.userModel,
          as: 'lecturer',
        },
        {
          model: this.courseModel,
          as: 'course',
        },
      ],
    });
  }
}

export default AnnouncementRepository;