// ptilms-api/controllers/CourseController.js
import {
  CourseNotFoundError,
  BadRequestError,
  ValidationError,
} from '../utils/errors.js';
import validator from 'validator';

class CourseController {
  constructor({ courseService, cacheService, courseMaterialService, assignmentService }) {
    this.courseService = courseService;
    this.cacheService = cacheService;
    this.courseMaterialService = courseMaterialService;
    this.assignmentService = assignmentService;
  }

  // List all courses with optional filters and caching
  async getAllCourses(req, res, next) {
    try {
      const { departmentId, levelId, page = 1, limit = 10 } = req.query;
      const cacheKey = `courses:all:${departmentId || ''}:${levelId || ''}:${page}:${limit}`;

      // Try cache
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const courses = await this.courseService.getAllCourses({
        departmentId,
        levelId,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });

      // Cache for 1 hour
      await this.cacheService.set(cacheKey, courses, 3600);
      res.json(courses);
    } catch (err) {
      next(err);
    }
  }

  // Get a single course by ID
  async getCourseById(req, res, next) {
    try {
      const { courseId } = req.params;
      if (!validator.isUUID(courseId)) {
        throw new ValidationError([{ field: 'courseId', message: 'Invalid UUID format' }]);
      }
      const cacheKey = `courses:${courseId}`;
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const course = await this.courseService.getCourseById(courseId);
      if (!course) throw new CourseNotFoundError();

      await this.cacheService.set(cacheKey, course, 3600);
      res.json(course);
    } catch (err) {
      next(err);
    }
  }

  // Create a new course
  async createCourse(req, res, next) {
    try {
      const {
        title,
        code,
        format,
        description,
        departmentId,
        levelId,
        isDepartmental = false,
        units = 0,
      } = req.body;

      // Basic validation
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

      const course = await this.courseService.createCourse({
        title,
        code,
        format,
        description,
        departmentId,
        levelId,
        isDepartmental,
        units,
      });

      // Invalidate list caches
      await this.cacheService.delByPrefix('courses:all:');
      res.status(201).json(course);
    } catch (err) {
      // Handle unique constraint from ORM
      if (err.name === 'SequelizeUniqueConstraintError') {
        const field = err.errors[0].path;
        return res.status(409).json({
          message: `Duplicate value for ${field}`,
          errors: err.errors.map(e => ({ field: e.path, message: e.message })),
        });
      }
      next(err);
    }
  }

  // Update an existing course
  async updateCourse(req, res, next) {
    try {
      const { courseId } = req.params;
      if (!validator.isUUID(courseId)) {
        throw new ValidationError([{ field: 'courseId', message: 'Invalid UUID format' }]);
      }
      if (req.body.units !== undefined && (!Number.isInteger(req.body.units) || req.body.units < 1)) {
        throw new ValidationError([{ field: 'units', message: 'Units must be a positive integer' }]);
      }

      const updated = await this.courseService.updateCourse(courseId, req.body);
      if (!updated) throw new CourseNotFoundError();

      // Invalidate caches
      await this.cacheService.del(`courses:${courseId}`);
      await this.cacheService.delByPrefix('courses:all:');

      res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  // Delete a course
  async deleteCourse(req, res, next) {
    try {
      const { courseId } = req.params;
      if (!validator.isUUID(courseId)) {
        throw new ValidationError([{ field: 'courseId', message: 'Invalid UUID format' }]);
      }
      await this.courseService.deleteCourse(courseId);
      // Invalidate caches
      await this.cacheService.del(`courses:${courseId}`);
      await this.cacheService.delByPrefix('courses:all:');

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  // Get course materials
  async getCourseMaterials(req, res, next) {
    try {
      const { id: courseId } = req.params;
      if (!validator.isUUID(courseId)) {
        throw new ValidationError([{ field: 'courseId', message: 'Invalid UUID format' }]);
      }

      const cacheKey = `course:${courseId}:materials`;
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const materials = await this.courseMaterialService.getCourseMaterialsByCourseId(courseId);
      await this.cacheService.set(cacheKey, materials, 1800); // Cache for 30 minutes
      res.json(materials);
    } catch (err) {
      next(err);
    }
  }

  // Get course assignments
  async getCourseAssignments(req, res, next) {
    try {
      const { id: courseId } = req.params;
      if (!validator.isUUID(courseId)) {
        throw new ValidationError([{ field: 'courseId', message: 'Invalid UUID format' }]);
      }

      const cacheKey = `course:${courseId}:assignments`;
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const assignments = await this.assignmentService.getAssignmentsByCourseId(courseId);
      await this.cacheService.set(cacheKey, assignments, 900); // Cache for 15 minutes
      res.json(assignments);
    } catch (err) {
      next(err);
    }
  }
}

export default CourseController;