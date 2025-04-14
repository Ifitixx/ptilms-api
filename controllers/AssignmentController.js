// ptilms-api/controllers/AssignmentController.js
import {
    AssignmentNotFoundError,
    BadRequestError,
    ValidationError,
} from '../utils/errors.js';
import validator from 'validator';

class AssignmentController {
    constructor({ assignmentService }) {
        this.assignmentService = assignmentService;
    }

    async getAllAssignments(req, res, next) {
        try {
            const assignments = await this.assignmentService.getAllAssignments();
            res.json(assignments);
        } catch (error) {
            next(error);
        }
    }

    async getAssignmentById(req, res, next) {
        try {
            const { id } = req.params;
            // Validate assignmentId format
            if (!validator.isUUID(id)) {
                throw new ValidationError([{ field: 'assignmentId', message: 'Invalid assignmentId format' }]);
            }
            const assignment = await this.assignmentService.getAssignmentById(id);
            if (!assignment) {
                throw new AssignmentNotFoundError();
            }
            res.json(assignment);
        } catch (error) {
            next(error);
        }
    }

    async getAssignmentsByCourseId(req, res, next) {
        try {
            const { courseId } = req.params;
            // Validate courseId format
            if (!validator.isUUID(courseId)) {
                throw new ValidationError([{ field: 'courseId', message: 'Invalid courseId format' }]);
            }
            const assignments = await this.assignmentService.getAssignmentsByCourseId(courseId);
            res.json(assignments);
        } catch (error) {
            next(error);
        }
    }

    async createAssignment(req, res, next) {
        try {
            const { title, description, courseId, departmentId, levelId } = req.body;
            if (!title || !description || !courseId || !departmentId || !levelId) {
                throw new BadRequestError('Title, description, courseId, departmentId, and levelId are required');
            }
            // Validate courseId format
            if (!validator.isUUID(courseId)) {
                throw new ValidationError([{ field: 'courseId', message: 'Invalid courseId format' }]);
            }
            // Validate departmentId format
            if (!validator.isUUID(departmentId)) {
                throw new ValidationError([{ field: 'departmentId', message: 'Invalid departmentId format' }]);
            }
            // Validate levelId format
            if (!validator.isUUID(levelId)) {
                throw new ValidationError([{ field: 'levelId', message: 'Invalid levelId format' }]);
            }
            const assignment = await this.assignmentService.createAssignment(req.body);
            res.status(201).json(assignment);
        } catch (error) {
            next(error);
        }
    }

    async updateAssignment(req, res, next) {
        try {
            const { id } = req.params;
            // Validate assignmentId format
            if (!validator.isUUID(id)) {
                throw new ValidationError([{ field: 'assignmentId', message: 'Invalid assignmentId format' }]);
            }
            const assignment = await this.assignmentService.updateAssignment(id, req.body);
            if (!assignment) {
                throw new AssignmentNotFoundError();
            }
            res.json(assignment);
        } catch (error) {
            next(error);
        }
    }

    async deleteAssignment(req, res, next) {
        try {
            const { id } = req.params;
            // Validate assignmentId format
            if (!validator.isUUID(id)) {
                throw new ValidationError([{ field: 'assignmentId', message: 'Invalid assignmentId format' }]);
            }
            const assignment = await this.assignmentService.getAssignmentById(id);
            if (!assignment) {
                throw new AssignmentNotFoundError();
            }
            await this.assignmentService.deleteAssignment(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

export default AssignmentController;