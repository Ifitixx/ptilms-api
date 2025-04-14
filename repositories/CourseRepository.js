// ptilms-api/repositories/CourseRepository.js
class CourseRepository {
  constructor(Course, Department, Level, User) { // Expect models directly
    this.courseModel = Course;
    this.departmentModel = Department;
    this.levelModel = Level;
    this.userModel = User;
  }

  async findByTitle(title) {
    return await this.courseModel.findOne({ where: { title } });
  }

  async getAllCourses() {
    return await this.courseModel.findAll({
      include: [
        {
          model: this.departmentModel,
          as: 'department',
        },
        {
          model: this.levelModel,
          as: 'level',
        },
        {
          model: this.userModel,
          as: 'lecturer',
        },
      ],
    });
  }

  async getCourseById(courseId) {
    return await this.courseModel.findByPk(courseId, {
      include: [
        {
          model: this.departmentModel,
          as: 'department',
        },
        {
          model: this.levelModel,
          as: 'level',
        },
        {
          model: this.userModel,
          as: 'lecturer',
        },
      ],
    });
  }

  async createCourse(data) {
    return await this.courseModel.create(data);
  }

  async updateCourse(courseId, data) {
    const course = await this.courseModel.findByPk(courseId);
    if (!course) return null;
    return await course.update(data);
  }

  async deleteCourse(courseId) {
    const course = await this.courseModel.findByPk(courseId);
    if (!course) return false;
    await course.destroy();
    return true;
  }
  async getCoursesByDepartmentId(departmentId) {
    return await this.courseModel.findAll({
      where: { departmentId: departmentId },
      include: [
        {
          model: this.departmentModel,
          as: 'department',
        },
        {
          model: this.levelModel,
          as: 'level',
        },
        {
          model: this.userModel,
          as: 'lecturer',
        },
      ],
    });
  }
  async getCoursesByLevelId(levelId) {
    return await this.courseModel.findAll({
      where: { levelId: levelId },
      include: [
        {
          model: this.departmentModel,
          as: 'department',
        },
        {
          model: this.levelModel,
          as: 'level',
        },
        {
          model: this.userModel,
          as: 'lecturer',
        },
      ],
    });
  }
  async getCoursesByLecturerId(lecturerId) {
    return await this.courseModel.findAll({
      where: { lecturerId: lecturerId },
      include: [
        {
          model: this.departmentModel,
          as: 'department',
        },
        {
          model: this.levelModel,
          as: 'level',
        },
        {
          model: this.userModel,
          as: 'lecturer',
        },
      ],
    });
  }
}

export default CourseRepository;