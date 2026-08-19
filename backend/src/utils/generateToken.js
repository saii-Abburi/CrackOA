import jwt from 'jsonwebtoken';
import env from '../config/env.js';

/**
 * Generate a signed JWT token for the given user.
 * @param {object} payload - { userId, role }
 * @returns {string} Signed JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

export default generateToken;
