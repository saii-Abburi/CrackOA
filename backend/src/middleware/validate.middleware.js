import { validationResult } from 'express-validator';
import { sendError } from '../utils/apiResponse.js';

/**
 * Runs after express-validator check() chains.
 * If there are validation errors, respond with 400 and the list of errors.
 * Otherwise call next().
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return sendError(res, 400, messages.join('. '), 'VALIDATION_ERROR', errors.array());
  }
  next();
};

export default validate;
