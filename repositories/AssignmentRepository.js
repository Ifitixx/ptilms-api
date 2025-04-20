// ptilms-api/repositories/AssignmentRepository.js
class AssignmentRepository {
  constructor({ Assignment, Course }) { // Changed to object parameter
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
}

export default AssignmentRepository;