// ptilms-api/services/CourseService.js
import { NotFoundError } from '../utils/errors.js';
import { error as _error } from '../utils/logger.js';

class CourseService {
  constructor({ courseRepository }) {
    this.courseRepository = courseRepository;
  }

  async getAllCourses() {
    try {
      return await this.courseRepository.getAllCourses();
    } catch (error) {
      _error(`Error in getAllCourses: ${error.message}`);
      throw error;
    }
  }

  async getCourseById(courseId) {
    try {
      const course = await this.courseRepository.getCourseById(courseId);
      if (!course) {
        throw new NotFoundError('Course not found');
      }
      return course;
    } catch (error) {
      _error(`Error in getCourseById: ${error.message}`);
      throw error;
    }
  }

  async createCourse(data) {
    try {
      return await this.courseRepository.createCourse(data);
    } catch (error) {
      _error(`Error in createCourse: ${error.message}`);
      throw error;
    }
  }

  async updateCourse(courseId, data) {
    try {
      const course = await this.courseRepository.updateCourse(courseId, data);
      if (!course) {
        throw new NotFoundError('Course not found');
      }
      return course;
    } catch (error) {
      _error(`Error in updateCourse: ${error.message}`);
      throw error;
    }
  }

  async deleteCourse(courseId) {
    try {
      const success = await this.courseRepository.deleteCourse(courseId);
      if (!success) {
        throw new NotFoundError('Course not found');
      }
    } catch (error) {
      _error(`Error in deleteCourse: ${error.message}`);
      throw error;
    }
  }
  async getCoursesByDepartmentId(departmentId) {
    try {
      return await this.courseRepository.getCoursesByDepartmentId(departmentId);
    } catch (error) {
      _error(`Error in getCoursesByDepartmentId: ${error.message}`);
      throw error;
    }
  }
  async getCoursesByLevelId(levelId) {
    try {
      return await this.courseRepository.getCoursesByLevelId(levelId);
    } catch (error) {
      _error(`Error in getCoursesByLevelId: ${error.message}`);
      throw error;
    }
  }
  async getCoursesByLecturerId(lecturerId) {
    try {
      return await this.courseRepository.getCoursesByLecturerId(lecturerId);
    } catch (error) {
      _error(`Error in getCoursesByLecturerId: ${error.message}`);
      throw error;
    }
  }
}

export default CourseService;