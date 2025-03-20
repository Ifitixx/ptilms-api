// config/constants.js
const ROLES = {
  ADMIN: 'admin',
  LECTURER: 'lecturer',
  STUDENT: 'student',
};

const USER_SELECTABLE_ROLES = [ROLES.LECTURER, ROLES.STUDENT]; // Roles users can select during registration

const PERMISSIONS = {
  USER_MANAGE: 'USER_MANAGE', // Manage users (create, edit, delete)
  ROLE_MANAGE: 'ROLE_MANAGE',
  PERMISSION_MANAGE: 'PERMISSION_MANAGE',
  COURSE_MANAGE: 'COURSE_MANAGE', // Manage courses (create, edit, delete)
  COURSE_CREATE: 'COURSE_CREATE', // Create courses
  COURSE_EDIT: 'COURSE_EDIT', // Edit courses
  COURSE_DELETE: 'COURSE_DELETE', // Delete courses
  ENROLLMENT_MANAGE: 'ENROLLMENT_MANAGE', // Manage student enrollments
  GRADE_VIEW: 'GRADE_VIEW', // View grades
  ASSIGNMENT_SUBMIT: 'ASSIGNMENT_SUBMIT', // Submit assignments
  ASSIGNMENT_GRADE: 'ASSIGNMENT_GRADE', // Grade assignments
};

const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
};

module.exports = {
  ROLES,
  PERMISSIONS,
  TOKEN_TYPES,
  USER_SELECTABLE_ROLES,
};