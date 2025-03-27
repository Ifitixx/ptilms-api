// ptilms-api/config/constants.mjs

// Roles
export const ROLES = {
  ADMIN: "admin",
  STUDENT: "student",
  LECTURER: "lecturer",
};
export const ROLE_NAMES = Object.values(ROLES);

// User-related constants
export const USER_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const USER_USERNAME_MIN_LENGTH = 3;
export const USER_USERNAME_MAX_LENGTH = 30;
export const USER_EMAIL_MAX_LENGTH = 254;
export const USER_PASSWORD_MIN_LENGTH = 8;
export const USER_SELECTABLE_ROLES = [ROLES.STUDENT, ROLES.LECTURER];
export const USER_SEX_ENUM = ["male", "female"];

// Permissions
export const PERMISSIONS = {
  USER_MANAGE: "USER_MANAGE",
  ROLE_MANAGE: "ROLE_MANAGE",
  PERMISSION_MANAGE: "PERMISSION_MANAGE",
  COURSE_MANAGE: "COURSE_MANAGE",
  COURSE_CREATE: "COURSE_CREATE",
  COURSE_EDIT: "COURSE_EDIT",
  COURSE_DELETE: "COURSE_DELETE",
  COURSE_READ: "COURSE_READ",
  ANNOUNCEMENT_CREATE: "ANNOUNCEMENT_CREATE",
  ANNOUNCEMENT_READ: "ANNOUNCEMENT_READ",
  ANNOUNCEMENT_UPDATE: "ANNOUNCEMENT_UPDATE",
  ANNOUNCEMENT_DELETE: "ANNOUNCEMENT_DELETE",
  ASSIGNMENT_CREATE: "ASSIGNMENT_CREATE",
  ASSIGNMENT_READ: "ASSIGNMENT_READ",
  ASSIGNMENT_UPDATE: "ASSIGNMENT_UPDATE",
  ASSIGNMENT_DELETE: "ASSIGNMENT_DELETE",
  CHAT_CREATE: "CHAT_CREATE",
  CHAT_READ: "CHAT_READ",
  CHAT_UPDATE: "CHAT_UPDATE",
  CHAT_DELETE: "CHAT_DELETE",
  CHAT_MESSAGE_CREATE: "CHAT_MESSAGE_CREATE",
  CHAT_MESSAGE_READ: "CHAT_MESSAGE_READ",
  CHAT_MESSAGE_UPDATE: "CHAT_MESSAGE_UPDATE",
  CHAT_MESSAGE_DELETE: "CHAT_MESSAGE_DELETE",
  DEPARTMENT_CREATE: "DEPARTMENT_CREATE",
  DEPARTMENT_READ: "DEPARTMENT_READ",
  DEPARTMENT_UPDATE: "DEPARTMENT_UPDATE",
  DEPARTMENT_DELETE: "DEPARTMENT_DELETE",
  LEVEL_CREATE: "LEVEL_CREATE",
  LEVEL_READ: "LEVEL_READ",
  LEVEL_UPDATE: "LEVEL_UPDATE",
  LEVEL_DELETE: "LEVEL_DELETE",
};

// Departments
export const DEPARTMENT_NAMES = [
  "Computer Engineering Technology",
  "Computer Science & Information Technology",
  "Electrical & Electronics Engineering Technology",
  "Industrial Safety & Environmental Technology",
  "Mechanical Engineering Technology",
  "Petroleum Engineering Technology",
  "Petroleum Marketing & Business Studies",
  "Petroleum & Natural Gas Processing Technology",
  "Science Laboratory Technology",
  "Welding Engineering & Offshore Technology",
  "General",
];

// Levels
export const LEVEL_NAMES = ["ND1", "ND2", "HND1", "HND2"];

// Courses
export const COURSES = [
  {
    title: "Introduction to Programming",
    code: "COM101",
    format: "Lecture",
    description: "Basic programming concepts",
    department: DEPARTMENT_NAMES[0],
    level: LEVEL_NAMES[0],
  },
  {
    title: "Data Structures and Algorithms",
    code: "COM201",
    format: "Lecture",
    description: "Advanced data structures",
    department: DEPARTMENT_NAMES[0],
    level: LEVEL_NAMES[1],
  },
  {
    title: "Database Management Systems",
    code: "COM301",
    format: "Lecture",
    description: "Database design and management",
    department: DEPARTMENT_NAMES[1],
    level: LEVEL_NAMES[2],
  },
  {
    title: "Web Development",
    code: "COM401",
    format: "Lecture",
    description: "Full-stack web development",
    department: DEPARTMENT_NAMES[1],
    level: LEVEL_NAMES[3],
  },
];

// Assignments
export const ASSIGNMENTS = [
  {
    title: "Programming Assignment 1",
    description: "Implement basic programming concepts",
    courseCode: "COM101",
    dueInDays: 7,
  },
  {
    title: "Data Structures Assignment",
    description: "Implement linked lists",
    courseCode: "COM201",
    dueInDays: 14,
  },
  {
    title: "Database Design Assignment",
    description: "Design a database schema",
    courseCode: "COM301",
    dueInDays: 10,
  },
  {
    title: "Web Development Project",
    description: "Build a full-stack web application",
    courseCode: "COM401",
    dueInDays: 21,
  },
];

// Announcements
export const ANNOUNCEMENTS = [
  {
    title: "Welcome to the New Semester!",
    content: "We are excited to start a new semester with you all.",
  },
  {
    title: "Important Notice: Midterm Exams",
    content: "Midterm exams will be held from [Start Date] to [End Date].",
  },
];

// Chat-related constants
export const CHAT_TYPES = {
  GROUP: "group",
  PRIVATE: "private",
};
export const CHATS = [
  { name: "General Chat" },
  { name: "COM101 Chat" },
  { name: "COM201 Chat" },
  { name: "COM301 Chat" },
  { name: "COM401 Chat" },
];
export const CHAT_MESSAGES = [
  { content: "Hello everyone!", chatName: "General Chat" },
  { content: "Welcome to the COM101 chat!", chatName: "COM101 Chat" },
];

// Course Materials
export const COURSES_MATERIAL_TYPES = {
  PDF: "pdf",
  VIDEO: "video",
  IMAGE: "image",
};
export const COURSES_MATERIALS = [
  {
    title: "Introduction to Programming - PDF",
    description: "PDF material for Introduction to Programming",
    type: COURSES_MATERIAL_TYPES.PDF,
    path: "/uploads/com101/intro.pdf",
    courseCode: "COM101",
  },
  {
    title: "Data Structures - Video",
    description: "Video material for Data Structures",
    type: COURSES_MATERIAL_TYPES.VIDEO,
    path: "/uploads/com201/data_structures.mp4",
    courseCode: "COM201",
  },
  {
    title: "Database Design - Image",
    description: "Image material for Database Design",
    type: COURSES_MATERIAL_TYPES.IMAGE,
    path: "/uploads/com301/database.jpg",
    courseCode: "COM301",
  },
  {
    title: "Web Development - Video",
    description: "Video material for Web Development",
    type: COURSES_MATERIAL_TYPES.VIDEO,
    path: "/uploads/com401/web_dev.mp4",
    courseCode: "COM401",
  },
];

// Default export for compatibility
export default {
  ROLES,
  ROLE_NAMES,
  USER_PASSWORD_REGEX,
  USER_USERNAME_MIN_LENGTH,
  USER_USERNAME_MAX_LENGTH,
  USER_EMAIL_MAX_LENGTH,
  USER_PASSWORD_MIN_LENGTH,
  USER_SELECTABLE_ROLES,
  USER_SEX_ENUM,
  PERMISSIONS,
  DEPARTMENT_NAMES,
  LEVEL_NAMES,
  COURSES,
  ASSIGNMENTS,
  ANNOUNCEMENTS,
  CHAT_TYPES,
  CHATS,
  CHAT_MESSAGES,
  COURSES_MATERIAL_TYPES,
  COURSES_MATERIALS,
};