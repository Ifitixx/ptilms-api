// ptilms-api/controllers/CourseController.js
import Course from '../models/Course.js';
import {
    CourseNotFoundError,
    BadRequestError,
    ValidationError,
} from '../utils/errors.js';
import validator from 'validator';

class CourseController {
    constructor({ courseService }) {
        this.courseService = courseService;
    }

    async getAllCourses(req, res, next) {
        try {
            const courses = await this.courseService.getAllCourses();
            res.json(courses);
        } catch (error) {
            next(error);
        }
    }

    async getCourseById(req, res, next) {
        try {
            const { courseId } = req.params;
            // Validate courseId format
            if (!validator.isUUID(courseId)) {
                throw new ValidationError([{ field: 'courseId', message: 'Invalid courseId format' }]);
            }
            const course = await this.courseService.getCourseById(courseId);
            if (!course) {
                throw new CourseNotFoundError();
            }
            res.json(course);
        } catch (error) {
            next(error);
        }
    }

    async getCoursesByDepartmentId(req, res, next) {
        try {
            const { departmentId } = req.params;
            // Validate departmentId format
            if (!validator.isUUID(departmentId)) {
                throw new ValidationError([{ field: 'departmentId', message: 'Invalid departmentId format' }]);
            }
            const courses = await this.courseService.getCoursesByDepartmentId(departmentId);
            res.json(courses);
        } catch (error) {
            next(error);
        }
    }
    
    async getCoursesByLevelId(req, res, next) {
        try {
            const { levelId } = req.params;
            // Validate levelId format
            if (!validator.isUUID(levelId)) {
                throw new ValidationError([{ field: 'levelId', message: 'Invalid levelId format' }]);
            }
            const courses = await this.courseService.getCoursesByLevelId(levelId);
            res.json(courses);
        } catch (error) {
            next(error);
        }
    }
    
    async getCoursesByLecturerId(req, res, next) {
        try {
            const { lecturerId } = req.params;
            // Validate lecturerId format
            if (!validator.isUUID(lecturerId)) {
                throw new ValidationError([{ field: 'lecturerId', message: 'Invalid lecturerId format' }]);
            }
            const courses = await this.courseService.getCoursesByLecturerId(lecturerId);
            res.json(courses);
        } catch (error) {
            next(error);
        }
    }

    async createCourse(req, res, next) {
        try {
            const { title, code, format, description, departmentId, levelId } = req.body;
            if (!title || !code || !format || !description || !departmentId || !levelId) {
                throw new BadRequestError('Title, code, format, description, departmentId, and levelId are required');
            }
            // Validate departmentId format
            if (!validator.isUUID(departmentId)) {
                throw new ValidationError([{ field: 'departmentId', message: 'Invalid departmentId format' }]);
            }
            // Validate levelId format
            if (!validator.isUUID(levelId)) {
                throw new ValidationError([{ field: 'levelId', message: 'Invalid levelId format' }]);
            }
            const course = await this.courseService.createCourse(req.body);
            res.status(201).json(course);
        } catch (error) {
            next(error);
        }
    }

    async updateCourse(req, res, next) {
        try {
            const { courseId } = req.params;
            // Validate courseId format
            if (!validator.isUUID(courseId)) {
                throw new ValidationError([{ field: 'courseId', message: 'Invalid courseId format' }]);
            }
            const course = await this.courseService.updateCourse(courseId, req.body);
            if (!course) {
                throw new CourseNotFoundError();
            }
            res.json(course);
        } catch (error) {
            next(error);
        }
    }

    async deleteCourse(req, res, next) {
        try {
            const { courseId } = req.params;
            // Validate courseId format
            if (!validator.isUUID(courseId)) {
                throw new ValidationError([{ field: 'courseId', message: 'Invalid courseId format' }]);
            }
            const course = await this.courseService.getCourseById(courseId);
            if (!course) {
                throw new CourseNotFoundError();
            }
            await this.courseService.deleteCourse(courseId);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async getCoursesByFilters(req, res, next) {
        try {
            const { departmentId, levelId, format } = req.query;
            // Validate departmentId format if provided
            if (departmentId && !validator.isUUID(departmentId)) {
                throw new ValidationError([{ field: 'departmentId', message: 'Invalid departmentId format' }]);
            }
            // Validate levelId format if provided
            if (levelId && !validator.isUUID(levelId)) {
                throw new ValidationError([{ field: 'levelId', message: 'Invalid levelId format' }]);
            }
            const courses = await this.courseService.getCoursesByFilters(req.query);
            res.json(courses);
        } catch (error) {
            next(error);
        }
    }
}

export default CourseController;