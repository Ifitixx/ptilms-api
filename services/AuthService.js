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

class AuthService {
  constructor({ userRepository, roleRepository, emailService }) { // Receive emailService
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.emailService = emailService;
  }

  // Correctly implemented checkEmailExists
  async checkEmailExists(email) {
    const user = await this.userRepository.getUserByEmail(email);
    return !!user; // Returns true if a user exists, false otherwise
  }

  async register(userData) {
    try {
      let { email, username, password, role } = userData;
      role = role.toLowerCase();

      // Check if the user already exists (using the corrected method)
      const emailExists = await this.checkEmailExists(email);
      if (emailExists) {
        throw new ConflictError('User with this email already exists');
      }

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
      const verificationLink = `${app.baseUrl}/auth/verify/${verificationToken}`;
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
      throw error;
    }
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

      return { accessToken, refreshToken, user };
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

      // Generate new tokens
      const accessToken = sign(
        { userId: user.id, email: user.email, role: user.role?.name },
        _jwt.secret,
        { expiresIn: _jwt.accessExpiry }
      );

      const newRefreshToken = sign(
        { userId: user.id, email: user.email, role: user.role?.name },
        _jwt.refreshSecret,
        { expiresIn: _jwt.refreshExpiry }
      );

      // Blacklist old refresh token
      const remainingTime = Math.floor((decoded.exp * 1000 - Date.now()) / 1000);
      if (remainingTime > 0) {
        await addToken(refreshToken, remainingTime);
      }
      // Calculate the expiration time (in seconds) for the access token
      const accessTokenExpiration = this.getAccessTokenExpirationInSeconds();

      return { accessToken, refreshToken: newRefreshToken, expires_in: accessTokenExpiration };
    } catch (error) {
      _error(`Refresh Token Error: ${error.message}`);
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedError('Refresh token expired');
      }
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedError('Invalid refresh token');
      }
      throw error;
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

      await this.userRepository.updateUser(user.id, { password: newPassword, resetToken: null, resetTokenExpiry: null });
      // Send email confirmation
      const emailSubject = 'Password Reset Confirmation';
      const emailHtml = `
        <p>Dear ${user.username},</p>
        <p>Your password has been successfully reset.</p>
        <p>If you did not perform this action, please contact us immediately.</p>
        <p>Sincerely,<br>The PTiLMS Team</p>
        `;
      await this.emailService.sendEmail(user.email, emailSubject, emailHtml);
      info(`Password reset for user ${user.email}`);
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