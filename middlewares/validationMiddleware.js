// ptilms-api/middlewares/validationMiddleware.js
const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');
const logger = require('../utils/logger'); // Import the logger

const validate = (validations) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    logger.error(`Validation errors: ${JSON.stringify(errors.array())}`); // Log the errors
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ field: err.path, message: err.msg }));

    return next(new ValidationError(extractedErrors));
  };
};

module.exports = { validate };