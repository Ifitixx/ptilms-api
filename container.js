// ptilms-api/container.js
import RoleRepository from './repositories/RoleRepository.js';
import UserRepository from './repositories/UserRepository.js';
import CourseRepository from './repositories/CourseRepository.js';
import AssignmentRepository from './repositories/AssignmentRepository.js';
import AnnouncementRepository from './repositories/AnnouncementRepository.js';
import ChatRepository from './repositories/ChatRepository.js';
import ChatMessageRepository from './repositories/ChatMessageRepository.js';
import DepartmentRepository from './repositories/DepartmentRepository.js';
import LevelRepository from './repositories/LevelRepository.js';
import PermissionRepository from './repositories/PermissionRepository.js';
import RolePermissionRepository from './repositories/RolePermissionRepository.js';
import CourseMaterialRepository from './repositories/CourseMaterialRepository.js';

import AuthService from './services/AuthService.js';
import UserService from './services/UserService.js';
import CourseService from './services/CourseService.js';
import AssignmentService from './services/AssignmentService.js';
import AnnouncementService from './services/AnnouncementService.js';
import ChatService from './services/ChatService.js';
import ChatMessageService from './services/ChatMessageService.js';
import DepartmentService from './services/DepartmentService.js';
import LevelService from './services/LevelService.js';
import PermissionService from './services/PermissionService.js';
import RolePermissionService from './services/RolePermissionService.js';
import CourseMaterialService from './services/CourseMaterialService.js';
import EmailService from './services/emailService.js';
import RoleService from './services/RoleService.js';

import AuthController from './controllers/authController.js';
import UserController from './controllers/userController.js';
import CourseController from './controllers/CourseController.js';
import AssignmentController from './controllers/AssignmentController.js';
import AnnouncementController from './controllers/AnnouncementController.js';
import ChatController from './controllers/ChatController.js';
import ChatMessageController from './controllers/ChatMessageController.js';
import DepartmentController from './controllers/DepartmentController.js';
import LevelController from './controllers/LevelController.js';
import PermissionController from './controllers/PermissionController.js';
import RoleController from './controllers/RoleController.js';
import RolePermissionController from './controllers/RolePermissionController.js';
import CourseMaterialController from './controllers/CourseMaterialController.js';
import { addToBlacklist, isBlacklisted } from './utils/tokenBlacklist.js'; // Import token blacklist functions
import { sequelize } from './models/index.js'; // Import sequelize

// This function will be called in server.js to initialize the container
export default function initializeContainer({ models }) { // Destructure models only
  const { Role, User, Course, Assignment, Announcement, Chat, ChatMessage, Department, Level, Permission, RolePermission, CourseMaterial } = models; // Use models

  // Repositories - Pass models as needed
  const roleRepository = new RoleRepository(Role);
  const userRepository = new UserRepository({ User, Role }); // Pass User and Role
  const courseRepository = new CourseRepository(Course, Department, Level, User); // Pass all required models
  const assignmentRepository = new AssignmentRepository(Assignment, Course); // Pass Assignment and Course
  const announcementRepository = new AnnouncementRepository({ Announcement, User, Course, Department, Level }); // Pass as object
  const chatRepository = new ChatRepository(Chat, User); // Pass Chat and User
  const chatMessageRepository = new ChatMessageRepository(ChatMessage, Chat, User); // Pass ChatMessage, Chat, and User
  const departmentRepository = new DepartmentRepository(Department);
  const levelRepository = new LevelRepository(Level);
  const permissionRepository = new PermissionRepository(Permission);
  const rolePermissionRepository = new RolePermissionRepository({ RolePermission, Role, Permission, sequelize }); // Pass as object, including sequelize
  const courseMaterialRepository = new CourseMaterialRepository(CourseMaterial, Course); // Pass CourseMaterial and Course

  // Services
  const roleService = new RoleService({ roleRepository }); // Add this line
  const emailService = new EmailService();
  const authService = new AuthService({ 
    userRepository, 
    roleRepository, 
    emailService,
    addToBlacklist, // Inject addToBlacklist
    isBlacklisted, // Inject isBlacklisted (for refreshToken)
  });
  const userService = new UserService({ 
    userRepository,
    addToBlacklist, // Inject addToBlacklist
  });
  const courseService = new CourseService({ courseRepository });
  const assignmentService = new AssignmentService({ assignmentRepository });
  const announcementService = new AnnouncementService({ announcementRepository });
  const chatService = new ChatService({ chatRepository });
  const chatMessageService = new ChatMessageService({ chatMessageRepository });
  const departmentService = new DepartmentService({ departmentRepository });
  const levelService = new LevelService({ levelRepository });
  const permissionService = new PermissionService({ permissionRepository });
  const rolePermissionService = new RolePermissionService({ rolePermissionRepository });
  const courseMaterialService = new CourseMaterialService({ courseMaterialRepository });

  // Controllers
  const authController = new AuthController({ authService });
  const userController = new UserController({ userService });
  const courseController = new CourseController({ courseService });
  const assignmentController = new AssignmentController({ assignmentService });
  const announcementController = new AnnouncementController({ announcementService });
  const chatController = new ChatController({ chatService });
  const chatMessageController = new ChatMessageController({ chatMessageService });
  const departmentController = new DepartmentController({ departmentService });
  const levelController = new LevelController({ levelService });
  const permissionController = new PermissionController({ permissionService });
  const roleController = new RoleController({ roleService });
  const rolePermissionController = new RolePermissionController({ rolePermissionService });
  const courseMaterialController = new CourseMaterialController({ courseMaterialService });

  return {
    roleRepository,
    userRepository,
    courseRepository,
    assignmentRepository,
    announcementRepository,
    chatRepository,
    chatMessageRepository,
    departmentRepository,
    levelRepository,
    permissionRepository,
    rolePermissionRepository,
    courseMaterialRepository,
    authService,
    userService,
    courseService,
    assignmentService,
    announcementService,
    chatService,
    chatMessageService,
    departmentService,
    levelService,
    permissionService,
    rolePermissionService,
    courseMaterialService,
    authController,
    userController,
    courseController,
    assignmentController,
    announcementController,
    chatController,
    chatMessageController,
    departmentController,
    levelController,
    permissionController,
    roleController,
    rolePermissionController,
    courseMaterialController,
    roleService,
  };
}