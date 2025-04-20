// ptilms-api/services/CourseService.js
import { CourseNotFoundError, BadRequestError, ValidationError } from '../utils/errors.js';
import validator from 'validator';

class CourseService {
  constructor({ courseRepository, departmentRepository, levelRepository, userRepository }) {
    this.courseRepository = courseRepository;
    this.departmentRepository = departmentRepository;
    this.levelRepository = levelRepository;
    this.userRepository = userRepository;
  }

  async getAllCourses(filters) {
    return this.courseRepository.findAll(filters);
  }

  async getCourseById(courseId) {
    if (!validator.isUUID(courseId)) {
      throw new ValidationError([{ field: 'courseId', message: 'Invalid UUID format' }]);
    }
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new CourseNotFoundError();
    }
    return course;
  }

  async createCourse(courseData) {
    const { title, code, format, description, departmentId, levelId, isDepartmental = false, units = 0 } = courseData;

    if (!title || !code || !format || !description || !departmentId || !levelId) {
      throw new BadRequestError('Missing required course fields');
    }

    if (!validator.isUUID(departmentId)) {
      throw new ValidationError([{ field: 'departmentId', message: 'Invalid UUID' }]);
    }

    if (!validator.isUUID(levelId)) {
      throw new ValidationError([{ field: 'levelId', message: 'Invalid UUID' }]);
    }

    if (!Number.isInteger(units) || units < 1) {
      throw new ValidationError([{ field: 'units', message: 'Units must be a positive integer' }]);
    }

    return this.courseRepository.create({
      title,
      code,
      format,
      description,
      departmentId,
      levelId,
      isDepartmental,
      units,
    });
  }

  async updateCourse(courseId, updates) {
    if (!validator.isUUID(courseId)) {
      throw new ValidationError([{ field: 'courseId', message: 'Invalid UUID format' }]);
    }

    if (updates.units !== undefined && (!Number.isInteger(updates.units) || updates.units < 1)) {
      throw new ValidationError([{ field: 'units', message: 'Units must be a positive integer' }]);
    }

    const updatedCourse = await this.courseRepository.update(courseId, updates);
    if (!updatedCourse) {
      throw new CourseNotFoundError();
    }
    return updatedCourse;
  }

  async deleteCourse(courseId) {
    if (!validator.isUUID(courseId)) {
      throw new ValidationError([{ field: 'courseId', message: 'Invalid UUID format' }]);
    }
    const courseExists = await this.courseRepository.findById(courseId);
    if (!courseExists) {
      throw new CourseNotFoundError();
    }
    await this.courseRepository.delete(courseId);
  }
}

export default CourseService;