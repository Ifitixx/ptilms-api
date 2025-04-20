// ptilms-api/routes/courseMaterials.js
import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';
import { validate, validationSchemas } from '../middlewares/validationMiddleware.js';
import { param } from 'express-validator';
import { ROLES } from '../config/constants.mjs';
const router = Router();

export default (courseMaterialController) => {
  // Create course material
  router.post('/', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER]),
    validate(validationSchemas.createCourseMaterial),
    (req, res, next) => courseMaterialController.createCourseMaterial(req, res, next)
  );

  // Get course materials by course ID (must be before /:id route)
  router.get('/course/:courseId',
    authenticateToken,
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER, ROLES.STUDENT]),
    validate([
      param('courseId').isUUID().withMessage('Invalid courseId format')
    ]),
    (req, res, next) => courseMaterialController.getCourseMaterialsByCourseId(req, res, next)
  );

  // Get course materials by material ID (must be before /:id route)
  router.get('/material/:materialId',
    authenticateToken,
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER, ROLES.STUDENT]),
    validate([
      param('materialId').isUUID().withMessage('Invalid materialId format')
    ]),
    (req, res, next) => courseMaterialController.getCourseMaterialsByMaterialId(req, res, next)
  );

  // Get all course materials
  router.get('/', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER]),
    (req, res, next) => courseMaterialController.getAllCourseMaterials(req, res, next)
  );

  // Get specific course material by ID
  router.get('/:id', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER]),
    validate([
      param('id').isUUID().withMessage('Invalid course material ID format')
    ]),
    (req, res, next) => courseMaterialController.getCourseMaterialById(req, res, next)
  );

  // Update course material
  router.put('/:id', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN, ROLES.LECTURER]),
    validate([
      param('id').isUUID().withMessage('Invalid course material ID format'),
      ...validationSchemas.updateCourseMaterial
    ]),
    (req, res, next) => courseMaterialController.updateCourseMaterial(req, res, next)
  );

  // Only admins can delete course materials
  router.delete('/:id', 
    authenticateToken, 
    authorizeRole([ROLES.ADMIN]),
    validate([
      param('id').isUUID().withMessage('Invalid course material ID format')
    ]),
    (req, res, next) => courseMaterialController.deleteCourseMaterial(req, res, next)
  );

  return router;
};