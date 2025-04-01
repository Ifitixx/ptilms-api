// ptilms-api/createAdmin.js
import { sequelize } from './models/index.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import config from './config/config.cjs';
import logger from './utils/logger.js';
import { USER_SELECTABLE_ROLES } from './config/constants.mjs';

const { saltRounds } = config;
const { info, error: _error } = logger;

async function createAdminUser() {
  try {
    // 1. Get the Admin Role ID
    const adminRole = await sequelize.models.Role.findOne({ where: { name: 'admin' } });
    if (!adminRole) {
      throw new Error("Admin role not found in the database. Please ensure the default roles are seeded.");
    }
    const adminRoleId = adminRole.id;

    // 2. Get Admin Details from Environment Variables or use defaults
    const adminEmail = process.env.ADMIN_EMAIL || 'defaultadmin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Macpizzy1999@';
    const adminUsername = 'admin'; // You can also make this configurable
    // Check if an admin user already exists
    const existingAdmin = await sequelize.models.User.findOne({ where: { roleId: adminRoleId } });
    if (existingAdmin) {
      info('Admin user already exists. Skipping creation.');
      return;
    }
    // 3. Hash the Password
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    // 4. Create the User
    const newAdminUser = await sequelize.models.User.create({
      id: uuidv4(),
      username: adminUsername,
      email: adminEmail,
      password: hashedPassword,
      roleId: adminRoleId,
      isVerified: true, // Assuming admins are verified by default
      // You can add other fields here like phoneNumber, dateOfBirth, etc. if needed
      // Make sure to either provide a refreshTokenHash or adjust your model to allow null
      refreshTokenHash: await bcrypt.hash(uuidv4(), saltRounds), // Temporary, will be updated on login
    });

    info(`Admin user created successfully: ${newAdminUser.username} (${newAdminUser.email})`);
  } catch (error) {
    _error(`Error creating admin user: ${error}`);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}

// Execute the function
createAdminUser();