'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const [tables] = await queryInterface.sequelize.query(
      `SELECT TABLE_NAME 
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE()`
    );

    // Users table indexes
    if (tables.find(t => t.TABLE_NAME === 'users')) {
      await queryInterface.addIndex('users', ['email'], {
        name: 'users_email_idx',
        unique: true
      });
      await queryInterface.addIndex('users', ['role_id'], {
        name: 'users_role_id_idx'
      });
      await queryInterface.addIndex('users', ['verification_token'], {
        name: 'users_verification_token_idx',
        unique: true
      });
      await queryInterface.addIndex('users', ['reset_token'], {
        name: 'users_reset_token_idx'
      });
      await queryInterface.addIndex('users', ['is_verified'], {
        name: 'users_is_verified_idx'
      });
      await queryInterface.addIndex('users', ['refresh_token_hash'], {
        name: 'users_refresh_token_hash_idx'
      });
    }

    // Courses table indexes
    if (tables.find(t => t.TABLE_NAME === 'courses')) {
      await queryInterface.addIndex('courses', ['code'], {
        name: 'courses_code_idx',
        unique: true
      });
      await queryInterface.addIndex('courses', ['title'], {
        name: 'courses_title_idx'
      });
      await queryInterface.addIndex('courses', ['is_departmental'], {
        name: 'courses_is_departmental_idx'
      });
      await queryInterface.addIndex('courses', ['lecturer_id'], {
        name: 'courses_lecturer_id_idx'
      });
      await queryInterface.addIndex('courses', ['department_id'], {
        name: 'courses_department_idx'
      });
      await queryInterface.addIndex('courses', ['level_id'], {
        name: 'courses_level_idx'
      });
    }

    // Assignments table indexes
    if (tables.find(t => t.TABLE_NAME === 'assignments')) {
      await queryInterface.addIndex('assignments', ['course_id'], {
        name: 'assignments_course_id_idx'
      });
      await queryInterface.addIndex('assignments', ['due_date'], {
        name: 'assignments_due_date_idx'
      });
      await queryInterface.addIndex('assignments', ['created_at'], {
        name: 'assignments_created_at_idx'
      });
      await queryInterface.addIndex('assignments', ['updated_at'], {
        name: 'assignments_updated_at_idx'
      });

      // Check for department_id and level_id columns
      const [columns] = await queryInterface.sequelize.query(
        `SELECT COLUMN_NAME 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'assignments'
         AND COLUMN_NAME IN ('department_id', 'level_id')`
      );

      if (columns.length > 0) {
        await queryInterface.addIndex('assignments', ['department_id'], {
          name: 'assignments_department_idx'
        });
        await queryInterface.addIndex('assignments', ['level_id'], {
          name: 'assignments_level_idx'
        });
      }
    }

    // Announcements table indexes
    if (tables.find(t => t.TABLE_NAME === 'announcements')) {
      await queryInterface.addIndex('announcements', ['created_at'], {
        name: 'announcements_created_at_idx'
      });

      // Check for department_id and level_id columns
      const [columns] = await queryInterface.sequelize.query(
        `SELECT COLUMN_NAME 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'announcements'
         AND COLUMN_NAME IN ('department_id', 'level_id')`
      );

      if (columns.length > 0) {
        await queryInterface.addIndex('announcements', ['department_id'], {
          name: 'announcements_department_idx'
        });
        await queryInterface.addIndex('announcements', ['level_id'], {
          name: 'announcements_level_idx'
        });
      }
    }

    // Chat messages indexes
    if (tables.find(t => t.TABLE_NAME === 'chat_messages')) {
      await queryInterface.addIndex('chat_messages', ['chat_id'], {
        name: 'chat_messages_chat_id_idx'
      });
      await queryInterface.addIndex('chat_messages', ['user_id'], {
        name: 'chat_messages_user_id_idx'
      });
      await queryInterface.addIndex('chat_messages', ['created_at'], {
        name: 'chat_messages_created_at_idx'
      });
    }

    // Role permissions indexes
    if (tables.find(t => t.TABLE_NAME === 'role_permissions')) {
      await queryInterface.addIndex('role_permissions', ['role_id'], {
        name: 'role_permissions_role_idx'
      });
      await queryInterface.addIndex('role_permissions', ['permission_id'], {
        name: 'role_permissions_permission_idx'
      });
    }

    // Chats indexes
    if (tables.find(t => t.TABLE_NAME === 'chats')) {
      await queryInterface.addIndex('chats', ['communication_type'], {
        name: 'chats_communication_type_idx'
      });
    }

    // Course materials indexes
    if (tables.find(t => t.TABLE_NAME === 'course_materials')) {
      await queryInterface.addIndex('course_materials', ['type'], {
        name: 'course_materials_type_idx'
      });
      await queryInterface.addIndex('course_materials', ['course_id'], {
        name: 'course_materials_course_idx'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Get all foreign key constraints with column information
    const [foreignKeys] = await queryInterface.sequelize.query(
      `SELECT 
        TABLE_NAME,
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
       FROM information_schema.KEY_COLUMN_USAGE
       WHERE REFERENCED_TABLE_NAME IS NOT NULL
       AND TABLE_SCHEMA = DATABASE()`
    );

    // Remove foreign key constraints first
    for (const fk of foreignKeys) {
      try {
        await queryInterface.removeConstraint(fk.TABLE_NAME, fk.CONSTRAINT_NAME);
      } catch (err) {
        console.log(`Could not remove constraint ${fk.CONSTRAINT_NAME} from ${fk.TABLE_NAME}, continuing...`);
      }
    }

    // Now remove indexes
    try {
      await queryInterface.removeIndex('course_materials', 'course_materials_course_idx');
      await queryInterface.removeIndex('course_materials', 'course_materials_type_idx');
      await queryInterface.removeIndex('chats', 'chats_communication_type_idx');
      await queryInterface.removeIndex('role_permissions', 'role_permissions_permission_idx');
      await queryInterface.removeIndex('role_permissions', 'role_permissions_role_idx');
      await queryInterface.removeIndex('chat_messages', 'chat_messages_created_at_idx');
      await queryInterface.removeIndex('chat_messages', 'chat_messages_user_id_idx');
      await queryInterface.removeIndex('chat_messages', 'chat_messages_chat_id_idx');
      await queryInterface.removeIndex('announcements', 'announcements_created_at_idx');
      await queryInterface.removeIndex('announcements', 'announcements_level_idx');
      await queryInterface.removeIndex('announcements', 'announcements_department_idx');
      await queryInterface.removeIndex('assignments', 'assignments_updated_at_idx');
      await queryInterface.removeIndex('assignments', 'assignments_created_at_idx');
      await queryInterface.removeIndex('assignments', 'assignments_due_date_idx');
      await queryInterface.removeIndex('assignments', 'assignments_level_idx');
      await queryInterface.removeIndex('assignments', 'assignments_department_idx');
      await queryInterface.removeIndex('assignments', 'assignments_course_id_idx');
      await queryInterface.removeIndex('courses', 'courses_is_departmental_idx');
      await queryInterface.removeIndex('courses', 'courses_title_idx');
      await queryInterface.removeIndex('courses', 'courses_code_idx');
      await queryInterface.removeIndex('courses', 'courses_lecturer_id_idx');
      await queryInterface.removeIndex('courses', 'courses_level_idx');
      await queryInterface.removeIndex('courses', 'courses_department_idx');
      await queryInterface.removeIndex('users', 'users_refresh_token_hash_idx');
      await queryInterface.removeIndex('users', 'users_is_verified_idx');
      await queryInterface.removeIndex('users', 'users_reset_token_idx');
      await queryInterface.removeIndex('users', 'users_verification_token_idx');
      await queryInterface.removeIndex('users', 'users_role_id_idx');
      await queryInterface.removeIndex('users', 'users_email_idx');
    } catch (err) {
      console.log('Some indexes may not exist, continuing...');
    }

    // Re-add the foreign key constraints
    for (const fk of foreignKeys) {
      try {
        await queryInterface.addConstraint(fk.TABLE_NAME, {
          type: 'foreign key',
          name: fk.CONSTRAINT_NAME,
          fields: [fk.COLUMN_NAME],
          references: {
            table: fk.REFERENCED_TABLE_NAME,
            field: fk.REFERENCED_COLUMN_NAME
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        });
      } catch (err) {
        console.log(`Could not re-add constraint ${fk.CONSTRAINT_NAME} to ${fk.TABLE_NAME}, continuing...`);
      }
    }
  }
};