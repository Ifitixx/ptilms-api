// ptilms-api/container.js
import CacheService from './services/cacheService.js';
import MonitoringService from './services/monitoringService.js';
import EmailQueueCleanupService from './services/emailQueueCleanupService.js';

// Repositories
import RoleRepository from './repositories/RoleRepository.js';
import UserRepository from './repositories/UserRepository.js';
import DepartmentRepository from './repositories/DepartmentRepository.js';
import LevelRepository from './repositories/LevelRepository.js';
import CourseRepository from './repositories/CourseRepository.js';
import AssignmentRepository from './repositories/AssignmentRepository.js';
import AnnouncementRepository from './repositories/AnnouncementRepository.js';
import ChatRepository from './repositories/ChatRepository.js';
import ChatMessageRepository from './repositories/ChatMessageRepository.js';
import PermissionRepository from './repositories/PermissionRepository.js';
import RolePermissionRepository from './repositories/RolePermissionRepository.js';
import CourseMaterialRepository from './repositories/CourseMaterialRepository.js';

// Services
import RoleService from './services/RoleService.js';
import UserService from './services/UserService.js';
import AuthService from './services/AuthService.js';
import DepartmentService from './services/DepartmentService.js';
import LevelService from './services/LevelService.js';
import CourseService from './services/CourseService.js';
import AssignmentService from './services/AssignmentService.js';
import AnnouncementService from './services/AnnouncementService.js';
import ChatService from './services/ChatService.js';
import ChatMessageService from './services/ChatMessageService.js';
import PermissionService from './services/PermissionService.js';
import RolePermissionService from './services/RolePermissionService.js';
import CourseMaterialService from './services/CourseMaterialService.js';

// Controllers
import AuthController from './controllers/authController.js';
import UserController from './controllers/userController.js';
import RoleController from './controllers/RoleController.js';
import DepartmentController from './controllers/DepartmentController.js';
import LevelController from './controllers/LevelController.js';
import CourseController from './controllers/CourseController.js';
import AssignmentController from './controllers/AssignmentController.js';
import AnnouncementController from './controllers/announcementController.js';
import ChatController from './controllers/ChatController.js';
import ChatMessageController from './controllers/ChatMessageController.js';
import PermissionController from './controllers/PermissionController.js';
import RolePermissionController from './controllers/RolePermissionController.js';
import CourseMaterialController from './controllers/CourseMaterialController.js';

function initializeContainer({ sequelize, models }) {
  // Initialize singleton services first
  const cacheService = new CacheService();
  const monitoringService = new MonitoringService();
  const emailQueueCleanupService = new EmailQueueCleanupService();

  // Initialize repositories with proper dependencies
  const roleRepository = new RoleRepository({ 
    Role: models.Role,
    sequelize
  });

  const userRepository = new UserRepository({
    User: models.User,
    Role: models.Role
  });

  const departmentRepository = new DepartmentRepository({
    Department: models.Department,
    sequelize
  });

  const levelRepository = new LevelRepository({
    Level: models.Level,
    sequelize
  });

  const courseRepository = new CourseRepository({
    Course: models.Course,
    Department: models.Department,
    Level: models.Level,
    User: models.User,
    sequelize
  });

  const assignmentRepository = new AssignmentRepository({
    Assignment: models.Assignment,
    Course: models.Course,
    Department: models.Department,
    Level: models.Level,
    sequelize
  });

  const announcementRepository = new AnnouncementRepository({
    Announcement: models.Announcement,
    Course: models.Course,
    User: models.User,
    Department: models.Department,
    Level: models.Level,
    sequelize
  });

  const chatRepository = new ChatRepository({
    Chat: models.Chat,
    sequelize
  });

  const chatMessageRepository = new ChatMessageRepository({
    ChatMessage: models.ChatMessage,
    Chat: models.Chat,
    User: models.User,
    sequelize
  });

  const permissionRepository = new PermissionRepository({
    Permission: models.Permission,
    sequelize
  });

  const rolePermissionRepository = new RolePermissionRepository({
    RolePermission: models.RolePermission,
    Role: models.Role,
    Permission: models.Permission,
    sequelize
  });

  const courseMaterialRepository = new CourseMaterialRepository({
    CourseMaterial: models.CourseMaterial,
    Course: models.Course,
    sequelize
  });

  // Initialize services with repositories and other dependencies
  const roleService = new RoleService({ roleRepository });
  
  const userService = new UserService({ 
    userRepository,
    roleRepository,
    mailer: emailQueueCleanupService 
  });

  const authService = new AuthService({ 
    userRepository,
    roleRepository,
    emailService: emailQueueCleanupService,
    addToBlacklist: (token) => cacheService.set(`blacklist:${token}`, true),
    isBlacklisted: async (token) => await cacheService.get(`blacklist:${token}`)
  });

  const departmentService = new DepartmentService({ departmentRepository });
  const levelService = new LevelService({ levelRepository });
  const courseService = new CourseService({ 
    courseRepository,
    departmentRepository,
    levelRepository,
    userRepository
  });

  const assignmentService = new AssignmentService({ 
    assignmentRepository,
    courseRepository,
    departmentRepository,
    levelRepository
  });

  const announcementService = new AnnouncementService({ 
    announcementRepository,
    courseRepository,
    userRepository,
    departmentRepository,
    levelRepository
  });

  const chatService = new ChatService({ chatRepository });
  const chatMessageService = new ChatMessageService({ 
    chatMessageRepository,
    chatRepository,
    userRepository
  });

  const permissionService = new PermissionService({ permissionRepository });
  const rolePermissionService = new RolePermissionService({ 
    rolePermissionRepository,
    roleRepository,
    permissionRepository
  });

  const courseMaterialService = new CourseMaterialService({
    courseMaterialRepository,
    courseRepository
  });

  // Initialize controllers with services
  const authController = new AuthController({ authService });
  const userController = new UserController({ userService });
  const roleController = new RoleController({ roleService });
  const departmentController = new DepartmentController({ departmentService });
  const levelController = new LevelController({ levelService });
  const courseController = new CourseController({ 
    courseService,
    cacheService,
    courseMaterialService,
    assignmentService
  });
  const assignmentController = new AssignmentController({ assignmentService });
  const announcementController = new AnnouncementController({ announcementService });
  const chatController = new ChatController({ chatService });
  const chatMessageController = new ChatMessageController({ chatMessageService });
  const permissionController = new PermissionController({ permissionService });
  const rolePermissionController = new RolePermissionController({ rolePermissionService });
  const courseMaterialController = new CourseMaterialController({ courseMaterialService });

  return {
    // Services
    cacheService,
    monitoringService,
    emailQueueCleanupService,
    roleService,
    userService,
    authService,
    departmentService,
    levelService,
    courseService,
    assignmentService,
    announcementService,
    chatService,
    chatMessageService,
    permissionService,
    rolePermissionService,
    courseMaterialService,

    // Controllers
    authController,
    userController,
    roleController,
    departmentController,
    levelController,
    courseController,
    assignmentController,
    announcementController,
    chatController,
    chatMessageController,
    permissionController,
    rolePermissionController,
    courseMaterialController
  };
}

export default initializeContainer;