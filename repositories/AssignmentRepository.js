// ptilms-api/repositories/AssignmentRepository.js
class AssignmentRepository {
  constructor({ Assignment, Course }) {
    this.assignmentModel = Assignment;
    this.courseModel = Course;
  }

  async getAllAssignments() {
    return await this.assignmentModel.findAll({
      include: {
        model: this.courseModel,
        as: 'course',
      },
    });
  }

  async getAssignmentById(assignmentId) {
    return await this.assignmentModel.findByPk(assignmentId, {
      include: {
        model: this.courseModel,
        as: 'course',
      },
    });
  }

  async createAssignment(data) {
    return await this.assignmentModel.create(data);
  }

  async updateAssignment(assignmentId, data) {
    const assignment = await this.assignmentModel.findByPk(assignmentId);
    if (!assignment) return null;
    return await assignment.update(data);
  }

  async deleteAssignment(assignmentId) {
    const assignment = await this.assignmentModel.findByPk(assignmentId);
    if (!assignment) return false;
    await assignment.destroy();
    return true;
  }

  async getAssignmentsByCourseId(courseId) {
    return await this.assignmentModel.findAll({
      where: { courseId: courseId },
      include: {
        model: this.courseModel,
        as: 'course',
      },
    });
  }

  async submitAssignment(assignmentId, userId, submissionText, submissionFileUrl) {
    try {
      // Access Submission model through the Assignment model's sequelize instance
      const submission = await this.assignmentModel.sequelize.models.Submission.create({
        assignmentId,
        userId,
        submissionText,
        submissionFileUrl,
      });
      return submission;
    } catch (error) {
      // Handle potential errors like duplicate submissions
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('You have already submitted this assignment.');
      }
      throw error;
    }
  }

  async getSubmission(assignmentId, userId) {
    try {
      // Access Submission model through the Assignment model's sequelize instance
      const submission = await this.assignmentModel.sequelize.models.Submission.findOne({
        where: { assignmentId, userId },
        include: [
          { model: this.assignmentModel, as: 'assignment' },
          // Access User model through the Assignment model's sequelize instance
          { model: this.assignmentModel.sequelize.models.User, as: 'user', attributes: ['id', 'username'] },
        ],
      });
      return submission;
    } catch (error) {
      throw error;
    }
  }

  async getSubmissionsByAssignment(assignmentId) {
    try {
      // Access Submission model through the Assignment model's sequelize instance
      const submissions = await this.assignmentModel.sequelize.models.Submission.findAll({
        where: { assignmentId },
        include: [
          // Access User model through the Assignment model's sequelize instance
          { model: this.assignmentModel.sequelize.models.User, as: 'user', attributes: ['id', 'username'] },
        ],
      });
      return submissions;
    } catch (error) {
      throw error;
    }
  }
}

export default AssignmentRepository;