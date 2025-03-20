// ptilms-api/utils/helpers.js

/**
 * Checks if a value is empty (null, undefined, empty string, or empty array).
 * @param {any} value - The value to check.
 * @returns {boolean} - True if the value is empty, false otherwise.
 */
const isEmpty = (value) => {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  return false;
};

/**
 * Generates a random string of a specified length.
 * @param {number} length - The length of the random string.
 * @returns {string} - The random string.
 */
const generateRandomString = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Formats a date object to a string in the format YYYY-MM-DD HH:mm:ss.
 * @param {Date} date - The date object to format.
 * @returns {string} - The formatted date string.
 */
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * Checks if a string is a valid email address.
 * @param {string} email - The email address to check.
 * @returns {boolean} - True if the email is valid, false otherwise.
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Checks if a string is a valid password.
 * @param {string} password - The password to check.
 * @returns {boolean} - True if the password is valid, false otherwise.
 */
const isValidPassword = (password) => {
  // Add your password validation logic here (e.g., minimum length, special characters, etc.)
  return password.length >= 8; // Example: Minimum length of 8
};

/**
 * Checks if a string is a valid phone number.
 * @param {string} phoneNumber - The phone number to check.
 * @returns {boolean} - True if the phone number is valid, false otherwise.
 */
const isValidPhoneNumber = (phoneNumber) => {
  // Add your phone number validation logic here (e.g., format, length, etc.)
  const phoneRegex = /^\d{10}$/; // Example: 10 digits
  return phoneRegex.test(phoneNumber);
};

module.exports = {
  isEmpty,
  generateRandomString,
  formatDate,
  isValidEmail,
  isValidPassword,
  isValidPhoneNumber,
};