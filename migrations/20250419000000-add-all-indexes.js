'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Users table indexes
    await queryInterface.addIndex('users', ['email'], { name: 'users_email_idx', unique: true });
    await queryInterface.addIndex('users', ['username'], { name: 'users_username_idx', unique: true }); // Added index for unique username
    await queryInterface.addIndex('users', ['role_id'], { name: 'users_role_id_idx' });
    await queryInterface.addIndex('users', ['verification_token'], { name: 'users_verification_token_idx', unique: true });
    await queryInterface.addIndex('users', ['reset_token'], { name: 'users_reset_token_idx' });
    await queryInterface.addIndex('users', ['is_verified'], { name: 'users_is_verified_idx' });
    await queryInterface.addIndex('users', ['refresh_token_hash'], { name: 'users_refresh_token_hash_idx' });
    await queryInterface.addIndex('users', ['deleted_at'], { name: 'users_deleted_at_idx' }); // Index for paranoid/soft delete


    // Courses table indexes (using combined indexes where logical)
    await queryInterface.addIndex('courses', ['code'], { name: 'courses_code_idx', unique: true });
    await queryInterface.addIndex('courses', ['title'], { name: 'courses_title_idx' });
    await queryInterface.addIndex('courses', ['is_departmental'], { name: 'courses_is_departmental_idx' });
    await queryInterface.addIndex('courses', ['lecturer_id'], { name: 'courses_lecturer_id_idx' });
    await queryInterface.addIndex('courses', ['department_id', 'level_id'], { name: 'courses_dept_level_idx' }); // Combined index
    await queryInterface.addIndex('courses', ['deleted_at'], { name: 'courses_deleted_at_idx' }); // Index for paranoid/soft delete


    // Assignments table indexes
    await queryInterface.addIndex('assignments', ['course_id'], { name: 'assignments_course_id_idx' });
    await queryInterface.addIndex('assignments', ['due_date'], { name: 'assignments_due_date_idx' });
    await queryInterface.addIndex('assignments', ['created_at'], { name: 'assignments_created_at_idx' });
    await queryInterface.addIndex('assignments', ['updated_at'], { name: 'assignments_updated_at_idx' });
    // Assuming filtering assignments by dept/level is common based on your previous index attempt
    await queryInterface.addIndex('assignments', ['department_id', 'level_id'], { name: 'assignments_dept_level_idx' }); // Combined index
    await queryInterface.addIndex('assignments', ['deleted_at'], { name: 'assignments_deleted_at_idx' }); // Index for paranoid/soft delete


    // Announcements table indexes
    await queryInterface.addIndex('announcements', ['created_at'], { name: 'announcements_created_at_idx' });
    // Assuming filtering announcements by dept/level is common
    await queryInterface.addIndex('announcements', ['department_id', 'level_id'], { name: 'announcements_dept_level_idx' }); // Combined index
    await queryInterface.addIndex('announcements', ['deleted_at'], { name: 'announcements_deleted_at_idx' }); // Index for paranoid/soft delete


    // Chat messages indexes
    await queryInterface.addIndex('chat_messages', ['chat_id'], { name: 'chat_messages_chat_id_idx' });
    await queryInterface.addIndex('chat_messages', ['user_id'], { name: 'chat_messages_user_id_idx' });
    await queryInterface.addIndex('chat_messages', ['created_at'], { name: 'chat_messages_created_at_idx' });
    await queryInterface.addIndex('chat_messages', ['deleted_at'], { name: 'chat_messages_deleted_at_idx' }); // Index for paranoid/soft delete


    // Role permissions indexes
    await queryInterface.addIndex('role_permissions', ['role_id', 'permission_id'], { name: 'role_permissions_role_perm_idx', unique: true }); // Combined unique index
    await queryInterface.addIndex('role_permissions', ['deleted_at'], { name: 'role_permissions_deleted_at_idx' }); // Index for paranoid/soft delete


    // Chats indexes
    await queryInterface.addIndex('chats', ['communication_type'], { name: 'chats_communication_type_idx' });
    await queryInterface.addIndex('chats', ['deleted_at'], { name: 'chats_deleted_at_idx' }); // Index for paranoid/soft delete


    // Course materials indexes
    await queryInterface.addIndex('course_materials', ['type'], { name: 'course_materials_type_idx' });
    await queryInterface.addIndex('course_materials', ['course_id', 'type'], { name: 'course_materials_course_type_idx' }); // Combined index
    await queryInterface.addIndex('course_materials', ['deleted_at'], { name: 'course_materials_deleted_at_idx' }); // Index for paranoid/soft delete

     // Indexes for other tables (roles, permissions, departments, levels)
     await queryInterface.addIndex('roles', ['name'], { name: 'roles_name_idx', unique: true });
     await queryInterface.addIndex('roles', ['deleted_at'], { name: 'roles_deleted_at_idx' });
     await queryInterface.addIndex('permissions', ['name'], { name: 'permissions_name_idx', unique: true });
     await queryInterface.addIndex('permissions', ['deleted_at'], { name: 'permissions_deleted_at_idx' });
     await queryInterface.addIndex('departments', ['name'], { name: 'departments_name_idx', unique: true });
     await queryInterface.addIndex('departments', ['deleted_at'], { name: 'departments_deleted_at_idx' });
     await queryInterface.addIndex('levels', ['name'], { name: 'levels_name_idx', unique: true });
     await queryInterface.addIndex('levels', ['deleted_at'], { name: 'levels_deleted_at_idx' });

  },

  async down(queryInterface, Sequelize) {
    // Remove indexes added in the 'up' function
    await queryInterface.removeIndex('course_materials', 'course_materials_course_type_idx');
    await queryInterface.removeIndex('course_materials', 'course_materials_type_idx');
    await queryInterface.removeIndex('course_materials', 'course_materials_deleted_at_idx');
    await queryInterface.removeIndex('chats', 'chats_communication_type_idx');
    await queryInterface.removeIndex('chats', 'chats_deleted_at_idx');
    await queryInterface.removeIndex('role_permissions', 'role_permissions_role_perm_idx');
    await queryInterface.removeIndex('role_permissions', 'role_permissions_deleted_at_idx');
    await queryInterface.removeIndex('chat_messages', 'chat_messages_created_at_idx');
    await queryInterface.removeIndex('chat_messages', 'chat_messages_user_id_idx');
    await queryInterface.removeIndex('chat_messages', 'chat_messages_chat_id_idx');
    await queryInterface.removeIndex('chat_messages', 'chat_messages_deleted_at_idx');
    await queryInterface.removeIndex('announcements', 'announcements_dept_level_idx');
    await queryInterface.removeIndex('announcements', 'announcements_created_at_idx');
    await queryInterface.removeIndex('announcements', 'announcements_deleted_at_idx');
    await queryInterface.removeIndex('assignments', 'assignments_dept_level_idx');
    await queryInterface.removeIndex('assignments', 'assignments_updated_at_idx');
    await queryInterface.removeIndex('assignments', 'assignments_created_at_idx');
    await queryInterface.removeIndex('assignments', 'assignments_due_date_idx');
    await queryInterface.removeIndex('assignments', 'assignments_course_id_idx');
    await queryInterface.removeIndex('assignments', 'assignments_deleted_at_idx');
    await queryInterface.removeIndex('courses', 'courses_dept_level_idx');
    await queryInterface.removeIndex('courses', 'courses_lecturer_id_idx');
    await queryInterface.removeIndex('courses', 'courses_is_departmental_idx');
    await queryInterface.removeIndex('courses', 'courses_title_idx');
    await queryInterface.removeIndex('courses', 'courses_code_idx');
    await queryInterface.removeIndex('courses', 'courses_deleted_at_idx');
    await queryInterface.removeIndex('users', 'users_refresh_token_hash_idx');
    await queryInterface.removeIndex('users', 'users_is_verified_idx');
    await queryInterface.removeIndex('users', 'users_reset_token_idx');
    await queryInterface.removeIndex('users', 'users_verification_token_idx');
    await queryInterface.removeIndex('users', 'users_role_id_idx');
    await queryInterface.removeIndex('users', 'users_username_idx');
    await queryInterface.removeIndex('users', 'users_email_idx');
    await queryInterface.removeIndex('users', 'users_deleted_at_idx');

    // Remove indexes for other tables
    await queryInterface.removeIndex('roles', 'roles_name_idx');
    await queryInterface.removeIndex('roles', 'roles_deleted_at_idx');
    await queryInterface.removeIndex('permissions', 'permissions_name_idx');
    await queryInterface.removeIndex('permissions', 'permissions_deleted_at_idx');
    await queryInterface.removeIndex('departments', 'departments_name_idx');
    await queryInterface.removeIndex('departments', 'departments_deleted_at_idx');
    await queryInterface.removeIndex('levels', 'levels_name_idx');
    await queryInterface.removeIndex('levels', 'levels_deleted_at_idx');
  }
};