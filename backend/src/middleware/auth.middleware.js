import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import env from '../config/env.js';
import { sendError } from '../utils/apiResponse.js';

/**
 * Protect routes — verifies JWT from Authorization header.
 * Attaches req.user on success.
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Access denied. No token provided.', 'NO_TOKEN');
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 401, 'Token has expired. Please login again.', 'TOKEN_EXPIRED');
      }
      return sendError(res, 401, 'Invalid token.', 'INVALID_TOKEN');
    }

    const user = await User.findById(decoded.userId).lean();
    if (!user) {
      return sendError(res, 401, 'User belonging to this token no longer exists.', 'USER_NOT_FOUND');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional protect middleware — populates req.user if token is present, but doesn't reject unauthenticated requests.
 */
export const optionalProtect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        const user = await User.findById(decoded.userId).lean();
        if (user) {
          req.user = user;
        }
      } catch {
        // Ignore token errors for optional protection
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Restrict access to specific roles.
 * Must be used after `protect`.
 * @param {...string} roles - Allowed roles
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        'You do not have permission to perform this action.',
        'FORBIDDEN'
      );
    }
    next();
  };
};

/**
 * Admin shortcut middleware.
 */
export const admin = restrictTo('admin');

