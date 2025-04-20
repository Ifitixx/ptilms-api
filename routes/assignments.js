// ptilms-api/routes/assignments.js
import express from 'express';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';
import { validate, validationSchemas } from '../middlewares/validationMiddleware.js';
import cacheMiddleware from '../middlewares/cacheMiddleware.js';
import rateLimiter from '../middlewares/rateLimiter.js';
import { ROLES } from '../config/constants.mjs';

const createAssignmentRoutes = (assignmentController) => {
  const router = express.Router();
  const { uploadLimiter } = rateLimiter;

  // List all assignments (cached for 15 minutes)
  router.get('/',
    authenticateToken,
    cacheMiddleware('assignments', 900),
    assignmentController.getAllAssignments
  );

  // Get single assignment (cached for 15 minutes)
  router.get('/:id',
    authenticateToken,
    cacheMiddleware('assignment', 900),
    assignmentController.getAssignmentById
  );

  // Create assignment (instructors and admins only)
  router.post('/',
    authenticateToken,
    authorizeRole([ROLES.INSTRUCTOR, ROLES.ADMIN]),
    uploadLimiter,
    validate(validationSchemas.createAssignment),
    assignmentController.createAssignment
  );

  // Update assignment (instructors and admins only)
  router.put('/:id',
    authenticateToken,
    authorizeRole([ROLES.INSTRUCTOR, ROLES.ADMIN]),
    validate(validationSchemas.createAssignment),
    assignmentController.updateAssignment
  );

  // Delete assignment (instructors and admins only)
  router.delete('/:id',
    authenticateToken,
    authorizeRole([ROLES.INSTRUCTOR, ROLES.ADMIN]),
    assignmentController.deleteAssignment
  );

  // Submit assignment (students only)
  router.post('/:id/submit',
    authenticateToken,
    authorizeRole([ROLES.STUDENT]),
    uploadLimiter,
    validate([
      body('submissionText').optional().trim().isLength({ max: 5000 }),
      body('courseId').isInt({ min: 1 }).withMessage('Valid course ID is required')
    ]),
    assignmentController.submitAssignment
  );

  // Get assignment submissions (instructors and admins only)
  router.get('/:id/submissions',
    authenticateToken,
    authorizeRole([ROLES.INSTRUCTOR, ROLES.ADMIN]),
    cacheMiddleware('assignment-submissions', 300), // Cache for 5 minutes
    assignmentController.getAssignmentSubmissions
  );

  return router;
};

export default createAssignmentRoutes;