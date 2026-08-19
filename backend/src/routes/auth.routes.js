import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

// Validation chains
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters.'),
  body('email').trim().isEmail().withMessage('Please provide a valid email.').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Please provide a valid email.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

const sendOtpValidation = [
  body('email').trim().isEmail().withMessage('Please provide a valid email.').normalizeEmail(),
];

const verifyOtpValidation = [
  body('email').trim().isEmail().withMessage('Please provide a valid email.').normalizeEmail(),
  body('otp').trim().notEmpty().isLength({ min: 6, max: 6 }).withMessage('OTP must be a 6-digit code.'),
];

const resetPasswordValidation = [
  body('email').trim().isEmail().withMessage('Please provide a valid email.').normalizeEmail(),
  body('otp').trim().notEmpty().isLength({ min: 6, max: 6 }).withMessage('OTP must be a 6-digit code.'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters.'),
];

const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters.'),
  body('email').optional().trim().isEmail().withMessage('Please provide a valid email.').normalizeEmail(),
];

const updatePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters.'),
];

// Standard Auth Routes
router.post('/register', authLimiter, registerValidation, validate, authController.register);
router.post('/login', authLimiter, loginValidation, validate, authController.login);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

// OTP Authentication Routes
router.post('/otp/send-login', authLimiter, sendOtpValidation, validate, authController.sendLoginOtp);
router.post('/otp/verify-login', authLimiter, verifyOtpValidation, validate, authController.verifyLoginOtp);
router.post('/otp/forgot-password', authLimiter, sendOtpValidation, validate, authController.sendForgotPasswordOtp);
router.post('/otp/reset-password', authLimiter, resetPasswordValidation, validate, authController.resetPasswordWithOtp);

// User Profile & Settings Routes
router.patch('/profile', protect, updateProfileValidation, validate, authController.updateProfile);
router.put('/update-password', protect, updatePasswordValidation, validate, authController.updatePassword);

export default router;
