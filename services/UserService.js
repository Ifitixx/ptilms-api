// ptilms-api/services/UserService.js
import {
  UserNotFoundError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  BadRequestError,
  EmailAlreadyExistsError,
  UsernameAlreadyExistsError,
  InvalidCredentialsError,
} from '../utils/errors.js';
import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/config.cjs';
const { jwtSecret, saltRounds } = config;
import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';
import { error as _error, info as _info } from '../utils/logger.js';

class UserService {
  constructor({ userRepository, roleRepository, mailer }) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.mailer = mailer;
  }

  async getAllUsers(includeDeleted = false) {  // Added includeDeleted parameter
    return this.userRepository.getAllUsers(includeDeleted);  // Pass parameter to repository
  }

  async getUserById(id, includeDeleted = false) { // Added includeDeleted parameter
    return this.userRepository.getUserById(id, includeDeleted); // Pass parameter to repository
  }

  async createUser(userData) {
    // Validate user data
    const errors = [];
    if (!userData.username || !validator.isLength(userData.username, { min: 3, max: 50 })) {
      errors.push({ field: 'username', message: 'Username is required and must be between 3 and 50 characters' });
    }
    if (!userData.email || !validator.isEmail(userData.email)) {
      errors.push({ field: 'email', message: 'Valid email is required' });
    }
    if (!userData.password || !validator.isLength(userData.password, { min: 8 })) {
      errors.push({ field: 'password', message: 'Password is required and must be at least 8 characters' });
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    // Check if email or username already exists
    const existingUser = await this.userRepository.findByEmailOrUsername(userData.email, userData.username);
    if (existingUser) {
      if (existingUser.email === userData.email) {
        throw new EmailAlreadyExistsError();
      }
      if (existingUser.username === userData.username) {
        throw new UsernameAlreadyExistsError();
      }
    }

    // Hash the password
    const hashedPassword = await hash(userData.password, saltRounds);

    // Generate a verification token
    const verificationToken = uuidv4();

    const user = await this.userRepository.createUser({
      ...userData,
      password: hashedPassword,
      verificationToken,
    });

    // Send verification email
    await this.mailer.sendVerificationEmail(user.email, verificationToken);

    return user;
  }

  async updateUser(id, data) {
    // Validate user ID
    if (!validator.isUUID(id)) {
      throw new ValidationError([{ field: 'id', message: 'Invalid user ID format' }]);
    }

    // Validate update data
    const errors = [];
    if (data.username && !validator.isLength(data.username, { min: 3, max: 50 })) {
      errors.push({ field: 'username', message: 'Username must be between 3 and 50 characters' });
    }
    if (data.email && !validator.isEmail(data.email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }    

    const updatedUser = await this.userRepository.updateUser(id, data);
    if (!updatedUser) {
      throw new UserNotFoundError();
    }

    return updatedUser;
  }

  async changePassword(userId, currentPassword, newPassword) { // Updated parameters
    // Validate inputs
    if (!validator.isUUID(userId)) {
      throw new ValidationError([{ field: 'userId', message: 'Invalid user ID format' }]);
    }
    if (!currentPassword) {
      throw new BadRequestError('Current password is required');
    }
    if (!newPassword || !validator.isLength(newPassword, { min: 8 })) {
      throw new ValidationError([{ field: 'newPassword', message: 'Password must be at least 8 characters long' }]);
    }
  
    // Refetch the user *right before* password comparison
    const user = await this.userRepository.getUserById(userId, true); // Ensure password hash is included
    if (!user) {
      throw new UserNotFoundError();
    }
  
    // Verify the current password
    const isMatch = await compare(currentPassword, user.password);
    if (!isMatch) {
      throw new InvalidCredentialsError();
    }
  
    // Update the password (without pre-hashing)
    const updateData = { password: newPassword }; // Pass plain text newPassword
    const updatedUser = await this.userRepository.updateUser(userId, updateData); // Use userId
  
    if (!updatedUser) {
      throw new Error('Failed to update password');
    }
  
    return true;
  }

  async deleteUser(id) {
    // Validate user ID
    if (!validator.isUUID(id)) {
      throw new ValidationError([{ field: 'id', message: 'Invalid user ID format' }]);
    }

    const success = await this.userRepository.deleteUser(id);
    if (!success) {
      throw new UserNotFoundError();
    }
  }

  async getModifiedUsers(since) { // Removed validation
    return this.userRepository.getModifiedUsers(since);
  }
}

export default UserService;