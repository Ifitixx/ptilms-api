// ptilms-api/config/constants.mjs
export const DEPARTMENT_COMPUTER_ENGINEERING_TECHNOLOGY = "Computer Engineering Technology";
export const DEPARTMENT_COMPUTER_SCIENCE_IT = "Computer Science & Information Technology";
export const DEPARTMENT_ELECTRICAL_ELECTRONICS_ENG_TECH = "Electrical & Electronics Engineering Technology";
export const DEPARTMENT_INDUSTRIAL_SAFETY_ENV_TECH = "Industrial Safety & Environmental Technology";
export const DEPARTMENT_MECHANICAL_ENGINEERING_TECHNOLOGY = "Mechanical Engineering Technology";
export const DEPARTMENT_PETROLEUM_ENGINEERING_TECHNOLOGY = "Petroleum Engineering Technology";
export const DEPARTMENT_PETROLEUM_MARKETING_BUSINESS_STUDIES = "Petroleum Marketing & Business Studies";
export const DEPARTMENT_PETROLEUM_NATURAL_GAS_PROCESSING_TECH = "Petroleum & Natural Gas Processing Technology";
export const DEPARTMENT_SCIENCE_LABORATORY_TECHNOLOGY = "Science Laboratory Technology";
export const DEPARTMENT_WELDING_ENGINEERING_OFFSHORE_TECH = "Welding Engineering & Offshore Technology";
export const DEPARTMENT_GENERAL = "General";

export const DEPARTMENT_NAMES = [
  DEPARTMENT_COMPUTER_ENGINEERING_TECHNOLOGY,
  DEPARTMENT_COMPUTER_SCIENCE_IT,
  DEPARTMENT_ELECTRICAL_ELECTRONICS_ENG_TECH,
  DEPARTMENT_INDUSTRIAL_SAFETY_ENV_TECH,
  DEPARTMENT_MECHANICAL_ENGINEERING_TECHNOLOGY,
  DEPARTMENT_PETROLEUM_ENGINEERING_TECHNOLOGY,
  DEPARTMENT_PETROLEUM_MARKETING_BUSINESS_STUDIES,
  DEPARTMENT_PETROLEUM_NATURAL_GAS_PROCESSING_TECH,
  DEPARTMENT_SCIENCE_LABORATORY_TECHNOLOGY,
  DEPARTMENT_WELDING_ENGINEERING_OFFSHORE_TECH,
  DEPARTMENT_GENERAL,
];

export const LEVEL_ND1 = "ND1";
export const LEVEL_ND2 = "ND2";
export const LEVEL_HND1 = "HND1";
export const LEVEL_HND2 = "HND2";

export const LEVEL_NAMES = [LEVEL_ND1, LEVEL_ND2, LEVEL_HND1, LEVEL_HND2];

export const ROLES = {
  ADMIN: "admin",
  STUDENT: "student",
  LECTURER: "lecturer",
};

export const ROLE_NAMES = Object.values(ROLES);

export const USER_SEX_ENUM = ["male", "female"];

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

export const COURSES = [
  {
    title: "Introduction to Programming",
    code: "COM101",
    format: "Lecture",
    description: "Basic programming concepts",
    department: DEPARTMENT_COMPUTER_ENGINEERING_TECHNOLOGY,
    level: LEVEL_ND1,
  },
  {
    title: "Data Structures and Algorithms",
    code: "COM201",
    format: "Lecture",
    description: "Advanced data structures",
    department: DEPARTMENT_COMPUTER_ENGINEERING_TECHNOLOGY,
    level: LEVEL_ND2,
  },
  {
    title: "Database Management Systems",
    code: "COM301",
    format: "Lecture",
    description: "Database design and management",
    department: DEPARTMENT_COMPUTER_SCIENCE_IT,
    level: LEVEL_HND1,
  },
  {
    title: "Web Development",
    code: "COM401",
    format: "Lecture",
    description: "Full-stack web development",
    department: DEPARTMENT_COMPUTER_SCIENCE_IT,
    level: LEVEL_HND2,
  },
];

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

export const CHAT_TYPES = {
  GROUP: 'group',
  PRIVATE: 'private',
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

export const COURSES_MATERIAL_TYPES = {
  PDF: 'pdf',
  VIDEO: 'video',
  IMAGE: 'image',
};

export const COURSES_MATERIALS = [
  {
    title: 'Introduction to Programming - PDF',
    description: 'PDF material for Introduction to Programming',
    type: COURSES_MATERIAL_TYPES.PDF,
    path: '/uploads/com101/intro.pdf',
    courseCode: 'COM101',
  },
  {
    title: 'Data Structures - Video',
    description: 'Video material for Data Structures',
    type: COURSES_MATERIAL_TYPES.VIDEO,
    path: '/uploads/com201/data_structures.mp4',
    courseCode: 'COM201',
  },
  {
    title: 'Database Design - Image',
    description: 'Image material for Database Design',
    type: COURSES_MATERIAL_TYPES.IMAGE,
    path: '/uploads/com301/database.jpg',
    courseCode: 'COM301',
  },
  {
    title: 'Web Development - Video',
    description: 'Video material for Web Development',
    type: COURSES_MATERIAL_TYPES.VIDEO,
    path: '/uploads/com401/web_dev.mp4',
    courseCode: 'COM401',
  },
];

export const USER_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const USER_USERNAME_MIN_LENGTH = 3;
export const USER_USERNAME_MAX_LENGTH = 30;
export const USER_EMAIL_MAX_LENGTH = 254;
export const USER_PASSWORD_MIN_LENGTH = 8;
export const USER_SELECTABLE_ROLES = [ROLES.STUDENT, ROLES.LECTURER];