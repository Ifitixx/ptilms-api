// ptilms-api/middlewares/validationMiddleware.js
import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors.js';
import { error } from '../utils/logger.js';

const validate = (validations) => {
  return async (req, res, next) => {
    console.log('validate - Request:', {
      method: req.method,
      url: req.url,
      path: req.path,
      params: req.params,
      query: req.query,
      validations: validations.map(v => v.builder.stack.flat().map(rule => rule.msg)),
    });
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    error(`Validation errors: ${JSON.stringify(errors.array())}`); // Log the errors
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ field: err.path, message: err.msg }));

    return next(new ValidationError(extractedErrors));
  };
};

export default { validate };