// ptilms-api/services/AuthService.js
import jwt from 'jsonwebtoken';
const { sign, verify, TokenExpiredError, JsonWebTokenError } = jwt;
import { UnauthorizedError, ConflictError, NotFoundError, ValidationError, BadRequestError } from '../utils/errors.js';
import { error as _error, info } from '../utils/logger.js';
import config from '../config/config.cjs';
const { jwt: _jwt, app } = config;
import { addToken, isBlacklisted } from '../utils/tokenBlacklist.js';
import { v4 as uuidv4 } from 'uuid';
import { USER_SELECTABLE_ROLES } from '../config/constants.mjs';
import bcrypt from 'bcrypt';

class AuthService {
  constructor({ userRepository, roleRepository, emailService }) { // Receive emailService
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.emailService = emailService;
  }

  async register(userData) {
    try {
      let { email, username, password, role } = userData;
      role = role.toLowerCase();

      // Validate the user-selected role (case-insensitive)
      if (!USER_SELECTABLE_ROLES.map(r => r.toLowerCase()).includes(role)) {
        throw new BadRequestError(`Invalid role selected. Allowed roles are: ${USER_SELECTABLE_ROLES.join(', ')}`);
      }

      // Get the role
      const userRole = await this.roleRepository.getRoleByName(role);
      if (!userRole) {
        throw new BadRequestError(`Invalid role selected. Role '${role}' not found in the database.`);
      }
      // Generate a unique verification token
      const verificationToken = uuidv4();
      const verificationTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      // Create the user
      const user = await this.userRepository.createUser({
        email,
        username,
        password,
        roleId: userRole.id,
        verificationToken, // Store the token
        verificationTokenExpiry, // Store the token expiry
        isVerified: false, // User is not verified initially
      });
      // Send verification email
      const verificationLink = `${app.baseUrl}/api/v1/auth/verify/${verificationToken}`; // Direct link
      const emailSubject = 'Welcome to PTiLMS! Verify Your Account';
      const emailHtml = `
        <p>Dear ${user.username},</p>
        <p>Thank you for registering with PTiLMS! Please click on the following link to verify your account:</p>
        <p><a href="${verificationLink}">${verificationLink}</a></p>
        <p>If you did not register for an account, please ignore this email.</p>
        <p>Sincerely,<br>The PTiLMS Team</p>
      `;
      await this.emailService.sendEmail(user.email, emailSubject, emailHtml);

      return user;
    } catch (error) {
      _error(`Error in register: ${error.message}`);
      if (error.name === 'SequelizeUniqueConstraintError') {
        // Handle unique constraint violations
        const errors = error.errors.map(e => ({ field: e.path, message: e.message }));
        if (errors.some(e => e.field === 'email')) {
          throw new ConflictError('Email already in use');
        } else if (errors.some(e => e.field === 'username')) {
          throw new ConflictError('Username already in use');
        } else {
          throw new ConflictError('Registration conflict'); // Generic message if neither email nor username
        }
      }
      throw error; // Re-throw other errors
    }
  }

  // Correctly implemented checkEmailExists
  async checkEmailExists(email) {
    const user = await this.userRepository.getUserByEmail(email);
    return !!user; // Returns true if a user exists, false otherwise
  }

  async login(email, password) {
    try {
      const user = await this.userRepository.getUserByEmail(email);
      if (!user) {
        throw new UnauthorizedError('Invalid credentials');
      }
      if (!user.isVerified) {
        throw new UnauthorizedError('User is not verified');
      }

      const isPasswordValid = await user.verifyPassword(password);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid credentials');
      }
      const roleName = user.role ? user.role.name : null;

      const accessToken = sign(
        { userId: user.id, email: user.email, role: roleName },
        _jwt.secret,
        { expiresIn: _jwt.accessExpiry }
      );

      const refreshToken = sign(
        { userId: user.id, email: user.email, role: roleName },
        _jwt.refreshSecret,
        { expiresIn: _jwt.refreshExpiry }
      );
      // Hash the refresh token before storing it
      const refreshTokenHash = await bcrypt.hash(refreshToken, 10); // Use a salt factor of 10
      
      // Update the user in the database with the hashed refresh token
      await this.userRepository.updateUser(user.id, { refreshTokenHash });

      return { accessToken, refreshToken, user }; // Return the plain text refresh token
    } catch (error) {
      _error(`Error in login: ${error.message}`);
      throw error;
    }
  }

  async refreshToken(refreshToken) {
    try {
      if (!refreshToken) throw new BadRequestError('Refresh token required');
  
      const decoded = verify(refreshToken, _jwt.refreshSecret);
      const user = await this.userRepository.getUserById(decoded.userId);
  
      if (!user) throw new UnauthorizedError('User not found');
      if (await isBlacklisted(refreshToken)) {
        throw new UnauthorizedError('Token revoked');
      }
  
      // Compare the provided refresh token with the stored hash
      if (!user.refreshTokenHash) {
        throw new UnauthorizedError('Refresh token not found for user'); // Handle case where hash is missing
      }
      const isTokenValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (!isTokenValid) {
        throw new UnauthorizedError('Invalid refresh token');
      }
  
      // Calculate remaining time for the *old* refresh token
      const remainingTime = Math.floor((decoded.exp * 1000 - Date.now()) / 1000);
  
      // Generate new tokens
      const accessToken = sign(
        { userId: user.id, email: user.email, role: user.role?.name },
        _jwt.secret,
        { expiresIn: _jwt.accessExpiry }
      );
  
      // Blacklist the *old* refresh token
      if (remainingTime > 0) {  // Only blacklist if it hasn't already expired
        await addToken(refreshToken, remainingTime);
      }
  
      const newRefreshToken = sign(
        { userId: user.id, email: user.email, role: user.role?.name },
        _jwt.refreshSecret,
        { expiresIn: _jwt.refreshExpiry }
      );
  
      // Hash the new refresh token and update it in the database
      const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
      await this.userRepository.updateUser(user.id, { refreshTokenHash: newRefreshTokenHash });
  
      // Calculate the expiration time (in seconds) for the access token
      const accessTokenExpiration = this.getAccessTokenExpirationInSeconds();
  
      return { accessToken, refreshToken: newRefreshToken, expires_in: accessTokenExpiration };
    } catch (error) {
        _error(`Error in refreshToken: ${error.message}`); // Log the error
        if (error instanceof TokenExpiredError || error instanceof JsonWebTokenError) {
          throw new UnauthorizedError('Invalid or expired refresh token');
        } else {
          throw error; // Re-throw other errors
        }
      }
    }
  
  getAccessTokenExpirationInSeconds() {
    const accessExpiry = _jwt.accessExpiry;
    const timeUnit = accessExpiry.slice(-1);
    const timeValue = parseInt(accessExpiry.slice(0, -1));
    let seconds;
    switch (timeUnit) {
      case 's':
        seconds = timeValue;
        break;
      case 'm':
        seconds = timeValue * 60;
        break;
      case 'h':
        seconds = timeValue * 60 * 60;
        break;
      case 'd':
        seconds = timeValue * 60 * 60 * 24;
        break;
      default:
        seconds = 900;
    }
    return seconds;
  }

  async resetPassword(token, newPassword) {
    try {
      const user = await this.userRepository.userModel.scope('withSensitive').findOne({ where: { resetToken: token } });
      if (!user || user.resetTokenExpiry < new Date()) {
        throw new UnauthorizedError('Invalid or expired token');
      }
      // Load the user instance
      const userInstance = await this.userRepository.getUserById(user.id);
      if (!userInstance) {
        throw new NotFoundError('User not found'); // Handle case where user disappears
      }
      // Set the new password on the instance
      userInstance.password = newPassword;
      // Save the instance to trigger the beforeSave hook
      await userInstance.save();
      // Clear the reset token
      await this.userRepository.updateUser(user.id, { resetToken: null, resetTokenExpiry: null });
      // ... rest of the method (email confirmation, logging) ...
    } catch (error) {
      _error(`Error in resetPassword: ${error.message}`);
      throw error;
    }
  }

  // New forgotPassword method
  async forgotPassword(email) {
    try {
      const user = await this.userRepository.getUserByEmail(email);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Generate a unique reset token
      const resetToken = uuidv4();
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      // Update the user with the reset token and expiry
      await this.userRepository.updateUser(user.id, { resetToken, resetTokenExpiry });

      // Send email with reset link
      const resetLink = `${app.baseUrl}/reset-password?token=${resetToken}`; // Construct the reset link
      const emailSubject = 'Password Reset Request';
      const emailHtml = `
        <p>Dear ${user.username},</p>
        <p>You have requested to reset your password. Please click on the following link to reset your password:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Sincerely,<br>The PTiLMS Team</p>
      `;

      await this.emailService.sendEmail(user.email, emailSubject, emailHtml);

      info(`Password reset token generated and email sent to ${email}`);
    } catch (error) {
      _error(`Error in forgotPassword: ${error.message}`);
      throw error;
    }
  }
  async verifyUser(token) {
    try {
      const user = await this.userRepository.getUserByVerificationToken(token);
      if (!user) {
        throw new UnauthorizedError('Invalid verification token');
      }
      if (user.verificationTokenExpiry < new Date()) {
        throw new UnauthorizedError('Expired verification token');
      }
      await this.userRepository.updateUser(user.id, {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      });
      info(`User ${user.email} has been verified`);
    } catch (error) {
      _error(`Error in verifyUser: ${error.message}`);
      throw error;
    }
  }
}

export default AuthService;