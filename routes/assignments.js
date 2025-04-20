// ptilms-api/routes/assignments.js
import express from 'express';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';
import { validate, validationSchemas } from '../middlewares/validationMiddleware.js';
import cacheMiddleware from '../middlewares/cacheMiddleware.js';
import rateLimiter from '../middlewares/rateLimiter.js';
import { ROLES } from '../config/constants.mjs';
import { body } from 'express-validator'; // <-- ADD THIS IMPORT

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
    // Use validate(validationSchemas.updateAssignment) if you have a separate schema
    validate(validationSchemas.createAssignment), // Assuming update schema is same as create for now
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
    uploadLimiter, // Consider if file uploads need a different limit or middleware
    validate(validationSchemas.submitAssignment || [
      body('submissionText').optional().trim().isLength({ max: 5000 }),
      // Assuming courseId is part of the body for submission, but it might be available from the assignment itself
      // Based on your Assignment model, courseId is a field. Validation should ensure it's a valid UUID.
      body('courseId').optional().isUUID().withMessage('Valid course ID is required'), // Assuming optional here, adjust as needed
      // Add validation for file uploads if applicable (e.g., using check or body with multer)
      // Example: body('submissionFile').custom((value, { req }) => { ... file validation ... })
    ]),
    assignmentController.submitAssignment // Ensure this method exists in AssignmentController
  );

  // Get assignment submissions (instructors and admins only)
  router.get('/:id/submissions',
    authenticateToken,
    authorizeRole([ROLES.INSTRUCTOR, ROLES.ADMIN]),
    cacheMiddleware('assignment-submissions', 300), // Cache for 5 minutes
    assignmentController.getAssignmentSubmissions // Ensure this method exists
  );

   // Get assignments by course ID (assuming a route like /course/:courseId/assignments)
   // This route path was not in server.js, verify if it's used elsewhere or intended
   // If intended, add app.use('/api/v1/assignments/course', ...) in server.js, or integrate into /assignments
   router.get('/course/:courseId',
     authenticateToken,
     cacheMiddleware('course-assignments', 600), // Cache for 10 minutes
     assignmentController.getAssignmentsByCourseId // Ensure this method exists
   );


  return router;
};

export default createAssignmentRoutes;