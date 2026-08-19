import User from '../models/User.js';
import Otp from '../models/Otp.js';
import generateToken from '../utils/generateToken.js';
import { generateOtp, sendOtpEmail } from './email.service.js';

/**
 * Register a new user.
 */
export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('An account with this email already exists.');
    error.statusCode = 409;
    error.code = 'EMAIL_EXISTS';
    throw error;
  }

  const user = await User.create({ name, email, password });
  const token = generateToken({ userId: user._id, role: user.role });

  return { user, token };
};

/**
 * Login a user with password.
 */
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const token = generateToken({ userId: user._id, role: user.role });
  const userObj = user.toJSON();
  return { user: userObj, token };
};

/**
 * Send OTP for email login.
 */
export const sendLoginOtp = async (email) => {
  // Check if user exists (or allow new email to create a base account)
  let user = await User.findOne({ email });
  if (!user) {
    // If not existing, create a default username from email prefix
    const name = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ');
    // Generate a random temporary password (user will login via OTP)
    const randomPassword = Math.random().toString(36).slice(-10) + 'A1!';
    user = await User.create({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email,
      password: randomPassword,
    });
  }

  // Remove any previous login OTPs for this email
  await Otp.deleteMany({ email, purpose: 'login' });

  const code = generateOtp();
  await Otp.create({
    email,
    otp: code,
    purpose: 'login',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendOtpEmail(email, code, 'login');

  return { message: 'OTP sent to your email successfully.' };
};

/**
 * Verify OTP and log in.
 */
export const verifyLoginOtp = async ({ email, otp }) => {
  const otpRecord = await Otp.findOne({ email, otp, purpose: 'login' });
  if (!otpRecord) {
    const error = new Error('Invalid or expired OTP code.');
    error.statusCode = 400;
    error.code = 'INVALID_OTP';
    throw error;
  }

  // Check expiration explicitly (in case TTL has not removed it yet)
  if (new Date() > otpRecord.expiresAt) {
    await Otp.deleteOne({ _id: otpRecord._id });
    const error = new Error('OTP has expired. Please request a new one.');
    error.statusCode = 400;
    error.code = 'OTP_EXPIRED';
    throw error;
  }

  // Clean up used OTP
  await Otp.deleteMany({ email, purpose: 'login' });

  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  const token = generateToken({ userId: user._id, role: user.role });
  const userObj = user.toJSON();

  return { user: userObj, token };
};

/**
 * Send OTP for forgot password.
 */
export const sendForgotPasswordOtp = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('No account found with this email address.');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  // Remove any previous forgot_password OTPs for this email
  await Otp.deleteMany({ email, purpose: 'forgot_password' });

  const code = generateOtp();
  await Otp.create({
    email,
    otp: code,
    purpose: 'forgot_password',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendOtpEmail(email, code, 'forgot_password');

  return { message: 'Password reset OTP sent to your email.' };
};

/**
 * Reset password using OTP.
 */
export const resetPasswordWithOtp = async ({ email, otp, newPassword }) => {
  const otpRecord = await Otp.findOne({ email, otp, purpose: 'forgot_password' });
  if (!otpRecord) {
    const error = new Error('Invalid or expired OTP code.');
    error.statusCode = 400;
    error.code = 'INVALID_OTP';
    throw error;
  }

  if (new Date() > otpRecord.expiresAt) {
    await Otp.deleteOne({ _id: otpRecord._id });
    const error = new Error('OTP has expired. Please request a new one.');
    error.statusCode = 400;
    error.code = 'OTP_EXPIRED';
    throw error;
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  // Set new password (pre-save hook will hash it)
  user.password = newPassword;
  await user.save();

  // Delete used OTP
  await Otp.deleteMany({ email, purpose: 'forgot_password' });

  return { message: 'Password reset successfully. You can now log in.' };
};

/**
 * Update user profile details (name, email).
 */
export const updateUserProfile = async (userId, { name, email }) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  // If email is changing, ensure it's not already in use by another user
  if (email && email.toLowerCase() !== user.email.toLowerCase()) {
    const emailExists = await User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
    if (emailExists) {
      const error = new Error('This email is already in use by another account.');
      error.statusCode = 409;
      error.code = 'EMAIL_EXISTS';
      throw error;
    }
    user.email = email.toLowerCase();
  }

  if (name) user.name = name.trim();

  await user.save();
  return user.toJSON();
};

/**
 * Update user password with current password verification.
 */
export const updateUserPassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    const error = new Error('Current password is incorrect.');
    error.statusCode = 400;
    error.code = 'INVALID_PASSWORD';
    throw error;
  }

  user.password = newPassword;
  await user.save();

  return { message: 'Password updated successfully.' };
};

/**
 * Get current authenticated user by ID.
 */
export const getMe = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }
  return user;
};
