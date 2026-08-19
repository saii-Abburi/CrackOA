import * as authService from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const { user, token } = await authService.registerUser({ name, email, password });

    return sendSuccess(res, 201, 'Account created successfully.', { user, token });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({ email, password });

    return sendSuccess(res, 200, 'Logged in successfully.', { user, token });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/otp/send-login
 */
export const sendLoginOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.sendLoginOtp(email);
    return sendSuccess(res, 200, result.message, null);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/otp/verify-login
 */
export const verifyLoginOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const { user, token } = await authService.verifyLoginOtp({ email, otp });
    return sendSuccess(res, 200, 'Logged in successfully via OTP.', { user, token });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/otp/forgot-password
 */
export const sendForgotPasswordOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.sendForgotPasswordOtp(email);
    return sendSuccess(res, 200, result.message, null);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/otp/reset-password
 */
export const resetPasswordWithOtp = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const result = await authService.resetPasswordWithOtp({ email, otp, newPassword });
    return sendSuccess(res, 200, result.message, null);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/auth/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await authService.updateUserProfile(req.user._id, { name, email });
    return sendSuccess(res, 200, 'Profile updated successfully.', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/update-password
 */
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.updateUserPassword(req.user._id, { currentPassword, newPassword });
    return sendSuccess(res, 200, result.message, null);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 */
export const logout = (req, res) => {
  return sendSuccess(res, 200, 'Logged out successfully. Please discard your token on the client.', null);
};

/**
 * GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user._id);
    return sendSuccess(res, 200, 'User profile fetched.', { user });
  } catch (error) {
    next(error);
  }
};
