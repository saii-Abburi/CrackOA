import { validationResult } from 'express-validator';

/**
 * Runs after express-validator check() chains.
 * If there are validation errors, responds with 400 and structured error details.
 * Otherwise calls next().
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorArray = errors.array();
    const messages = [...new Set(errorArray.map((e) => e.msg))];
    const details = errorArray.map((e) => ({
      field: e.path || e.param || 'unknown',
      message: e.msg,
    }));

    return res.status(400).json({
      success: false,
      message: messages.join('. '),
      error: {
        code: 'VALIDATION_ERROR',
        details,
      },
    });
  }
  next();
};

export default validate;

