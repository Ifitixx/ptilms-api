// ptilms-api/routes/courses.js
import { Router } from 'express';
import { param, body } from 'express-validator';
import authMiddleware from '../middlewares/authMiddleware.js';
const { authenticateToken, authorizeRole, ROLES } = authMiddleware;
import validationMiddleware from '../middlewares/validationMiddleware.js';
const { validate } = validationMiddleware;

const router = Router();

export default (courseController) => {
  /**
   * @swagger
   * /courses:
   *   post:
   *     summary: Create a new course
   *     tags: [Courses]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               code:
   *                 type: string
   *               format:
   *                 type: string
   *               description:
   *                 type: string
   *               departmentId:
   *                 type: string
   *               levelId:
   *                 type: string
   *               isDepartmental:
   *                 type: boolean
   *               units:
   *                 type: integer
   *     responses:
   *       201:
   *         description: Course created successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       500:
   *         description: Internal server error
   */
  router.post('/', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), validate([
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('code').trim().notEmpty().withMessage('Code is required'),
    body('format').trim().notEmpty().withMessage('Format is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('departmentId').trim().notEmpty().withMessage('DepartmentId is required').isUUID().withMessage('Invalid departmentId format'),
    body('levelId').trim().notEmpty().withMessage('LevelId is required').isUUID().withMessage('Invalid levelId format'),
    body('isDepartmental').optional().isBoolean().withMessage('isDepartmental must be a boolean'),
    body('units').isInt({ min: 1 }).withMessage('Units must be a positive integer'),
  ]), (req, res, next) => courseController.createCourse(req, res, next));

  /**
   * @swagger
   * /courses:
   *   get:
   *     summary: Get all courses
   *     tags: [Courses]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Courses found
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER, ROLES.STUDENT]), (req, res, next) => courseController.getAllCourses(req, res, next));

  /**
   * @swagger
   * /courses/{courseId}:
   *   get:
   *     summary: Get course by ID
   *     tags: [Courses]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: courseId
   *         required: true
   *         description: ID of the course
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Course found
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Course not found
   *       500:
   *         description: Internal server error
   */
  router.get('/:courseId', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER, ROLES.STUDENT]), validate([
    param('courseId').isUUID().withMessage('Invalid course ID format'),
  ]), (req, res, next) => courseController.getCourseById(req, res, next));

  /**
   * @swagger
   * /courses/{courseId}:
   *   put:
   *     summary: Update course by ID
   *     tags: [Courses]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: courseId
   *         required: true
   *         description: ID of the course
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               code:
   *                 type: string
   *               format:
   *                 type: string
   *               description:
   *                 type: string
   *               departmentId:
   *                 type: string
   *               levelId:
   *                 type: string
   *               isDepartmental:
   *                 type: boolean
   *               units:
   *                 type: integer
   *     responses:
   *       200:
   *         description: Course updated successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Course not found
   *       500:
   *         description: Internal server error
   */
  router.put('/:courseId', authenticateToken, authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), validate([
    param('courseId').isUUID().withMessage('Invalid course ID format'),
    body('title').optional().trim().notEmpty().withMessage('Title is required'),
    body('code').optional().trim().notEmpty().withMessage('Code is required'),
    body('format').optional().trim().notEmpty().withMessage('Format is required'),
    body('description').optional().trim().notEmpty().withMessage('Description is required'),
    body('departmentId').optional().trim().notEmpty().withMessage('DepartmentId is required').isUUID().withMessage('Invalid departmentId format'),
    body('levelId').optional().trim().notEmpty().withMessage('LevelId is required').isUUID().withMessage('Invalid levelId format'),
    body('isDepartmental').optional().isBoolean().withMessage('isDepartmental must be a boolean'),
    body('units').optional().isInt({ min: 1 }).withMessage('Units must be a positive integer'),
  ]), (req, res, next) => courseController.updateCourse(req, res, next));

  /**
   * @swagger
   * /courses/{courseId}:
   *   delete:
   *     summary: Delete course by ID
   *     tags: [Courses]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: courseId
   *         required: true
   *         description: ID of the course
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Course deleted successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Course not found
   *       500:
   *         description: Internal server error
   */
  router.delete('/:courseId', authenticateToken, authorizeRole([ROLES.ADMIN]), validate([
    param('courseId').isUUID().withMessage('Invalid course ID format'),]), (req, res, next) => courseController.deleteCourse(req, res, next));

  return router;
}