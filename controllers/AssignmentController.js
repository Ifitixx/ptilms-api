// ptilms-api/controllers/AssignmentController.js
import {
    AssignmentNotFoundError,
    BadRequestError,
    ValidationError,
    SubmissionError,
} from '../utils/errors.js';
import validator from 'validator';
import config from '../config/config.cjs';

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

    async submitAssignment(req, res, next) {
        try {
            const { id: assignmentId } = req.params;
            const userId = req.user.id; // Assuming user ID is available in req.user
            const { submissionText } = req.body;
            const fileData = req.body.fileData; // Get file data from the request

            // Validate assignmentId format
            if (!validator.isUUID(assignmentId)) {
                throw new ValidationError([{ field: 'assignmentId', message: 'Invalid assignmentId format' }]);
            }

            // Validate submission data: either text or file must be provided
            if (!submissionText && (!fileData || !fileData.fileName || !fileData.originalName)) {
                throw new BadRequestError('Submission must include either text or a file.');
            }

            const submission = await this.assignmentService.submitAssignment({
                assignmentId,
                userId,
                submissionText,
                fileKey: fileData?.fileName, // Store the fileKey
                originalFilename: fileData?.originalName, // Store the originalFilename
            });

            res.status(201).json({
                ...submission.toJSON(),
                url: fileData ? `${config.minio.endpoint}/ptilms-uploads/submissions/${fileData.fileName}` : null
            });
        } catch (error) {
            if (error instanceof SubmissionError) {
                // Handle specific submission errors (e.g., duplicate submissions)
                return res.status(400).json({ errors: [{ message: error.message }] });
            }
            next(error);
        }
    }

    async getSubmission(req, res, next) {
        try {
            const { id: assignmentId } = req.params;
            const userId = req.user.id; // Assuming user ID is available in req.user
            // Validate assignmentId format
            if (!validator.isUUID(assignmentId)) {
                throw new ValidationError([{ field: 'assignmentId', message: 'Invalid assignmentId format' }]);
            }
            const submission = await this.assignmentService.getSubmission(assignmentId, userId);
            if (!submission) {
                return res.status(204).send(); // No Content if no submission found
            }
            res.status(200).json(submission);
        } catch (error) {
            next(error);
        }
    }

    async getSubmissionsByAssignment(req, res, next) {
        try {
            const { id: assignmentId } = req.params;
            // In a real application, you'd likely have authorization checks here
            // to ensure only authorized users (e.g., instructors) can access all submissions
            // Validate assignmentId format
            if (!validator.isUUID(assignmentId)) {
                throw new ValidationError([{ field: 'assignmentId', message: 'Invalid assignmentId format' }]);
            }
            const submissions = await this.assignmentService.getSubmissionsByAssignment(assignmentId);
            res.status(200).json(submissions);
        } catch (error) {
            next(error);
        }
    }
}

export default AssignmentController;