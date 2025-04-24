// ptilms-api/controllers/CourseMaterialController.js
import {
    CourseMaterialNotFoundError,
    BadRequestError,
    ValidationError,
} from '../utils/errors.js';
import validator from 'validator';
import config from '../config/config.cjs';

class CourseMaterialController {
    constructor({ courseMaterialService }) {
        this.courseMaterialService = courseMaterialService;
    }

    async getAllCourseMaterials(req, res, next) {
        try {
            const courseMaterials = await this.courseMaterialService.getAllCourseMaterials();
            res.json(courseMaterials);
        } catch (error) {
            next(error);
        }
    }

    async getCourseMaterialById(req, res, next) {
        try {
            const { courseMaterialId } = req.params;
            // Validate courseMaterialId format
            if (!validator.isUUID(courseMaterialId)) {
                throw new ValidationError([{ field: 'courseMaterialId', message: 'Invalid courseMaterialId format' }]);
            }
            const courseMaterial = await this.courseMaterialService.getCourseMaterialById(courseMaterialId);
            if (!courseMaterial) {
                throw new CourseMaterialNotFoundError();
            }
            res.json(courseMaterial);
        } catch (error) {
            next(error);
        }
    }

    async getCourseMaterialsByMaterialId(req, res, next) {
        try {
            const { materialId } = req.params;
            // Validate materialId format
            if (!validator.isUUID(materialId)) {
                throw new ValidationError([{ field: 'materialId', message: 'Invalid materialId format' }]);
            }
            const courseMaterials = await this.courseMaterialService.getCourseMaterialsByMaterialId(materialId);
            res.json(courseMaterials);
        } catch (error) {
            next(error);
        }
    }

    async createCourseMaterial(req, res, next) {
        try {
            const { title, description, courseId, type } = req.body;
            const fileData = req.body.fileData; // Get file data from the request

            if (!title || !description || !courseId || !type) {
                throw new BadRequestError('Title, description, courseId, and type are required');
            }
            // Validate courseId format
            if (!validator.isUUID(courseId)) {
                throw new ValidationError([{ field: 'courseId', message: 'Invalid courseId format' }]);
            }
            // Validate fileData
            if (!fileData || !fileData.fileName || !fileData.originalName) {
                throw new BadRequestError('fileData with fileName and originalName are required');
            }

            const courseMaterial = await this.courseMaterialService.createCourseMaterial({
                title,
                description,
                courseId,
                type,
                fileKey: fileData.fileName, // Store the fileKey
                originalName: fileData.originalName, // Store the originalName
            });
            res.status(201).json({
                ...courseMaterial.toJSON(),
                url: `${config.minio.endpoint}/ptilms-uploads/${fileData.fileName}`
            });
        } catch (error) {
            next(error);
        }
    }

    async updateCourseMaterial(req, res, next) {
        try {
            const { courseMaterialId } = req.params;
            // Validate courseMaterialId format
            if (!validator.isUUID(courseMaterialId)) {
                throw new ValidationError([{ field: 'courseMaterialId', message: 'Invalid courseMaterialId format' }]);
            }
            const courseMaterial = await this.courseMaterialService.updateCourseMaterial(courseMaterialId, req.body);
            if (!courseMaterial) {
                throw new CourseMaterialNotFoundError();
            }
            res.json(courseMaterial);
        } catch (error) {
            next(error);
        }
    }

    async deleteCourseMaterial(req, res, next) {
        try {
            const { courseMaterialId } = req.params;
            // Validate courseMaterialId format
            if (!validator.isUUID(courseMaterialId)) {
                throw new ValidationError([{ field: 'courseMaterialId', message: 'Invalid courseMaterialId format' }]);
            }
            const courseMaterial = await this.courseMaterialService.getCourseMaterialById(courseMaterialId);
            if (!courseMaterial) {
                throw new CourseMaterialNotFoundError();
            }
            await this.courseMaterialService.deleteCourseMaterial(courseMaterialId);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async getCourseMaterialsByCourseId(req, res, next) {
        try {
            const { courseId } = req.params;
            // Validate courseId format
            if (!validator.isUUID(courseId)) {
                throw new ValidationError([{ field: 'courseId', message: 'Invalid courseId format' }]);
            }
            const courseMaterials = await this.courseMaterialService.getCourseMaterialsByCourseId(courseId);
            res.json(courseMaterials);
        } catch (error) {
            next(error);
        }
    }
}

export default CourseMaterialController;