// ptilms-api/routes/assignments.js
import express from 'express';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';
import { validate, validationSchemas } from '../middlewares/validationMiddleware.js';
import cacheMiddleware from '../middlewares/cacheMiddleware.js';
import rateLimiter from '../middlewares/rateLimiter.js';
import { ROLES } from '../config/constants.mjs';
import multer from 'multer'; // Import multer
import path from 'path';
import { fileURLToPath } from 'url';
import s3 from '../config/aws.js';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createAssignmentRoutes = (assignmentController) => {
  const router = express.Router();
  const { uploadLimiter } = rateLimiter;

  // Multer configuration
  const storage = multer.memoryStorage();
  const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
      const allowedTypes = /pdf|jpeg|png/;
      const extname = path.extname(file.originalname).toLowerCase().replace('.', '');
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && allowedTypes.test(extname)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only PDF, JPEG, and PNG are allowed.'), false);
      }
    },
  });

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
    upload.single('submissionFile'), // Use multer middleware for single file upload
    uploadLimiter, // Consider if file uploads need a different limit or middleware
    validate(validationSchemas.submitAssignment),
    assignmentController.submitAssignment
  );
  // Get assignment submissions (instructors and admins only)
  router.get('/:id/submissions',
    authenticateToken,
    authorizeRole([ROLES.INSTRUCTOR, ROLES.ADMIN]),
    cacheMiddleware('assignment-submissions', 300), // Cache for 5 minutes
    assignmentController.getSubmissionsByAssignment // Ensure this method exists
  );
  // Get a specific submission for an assignment by a user (students and instructors)
  router.get('/:id/submissions/me',
    authenticateToken,
    assignmentController.getSubmission
  );
  return router;
};
export default createAssignmentRoutes;