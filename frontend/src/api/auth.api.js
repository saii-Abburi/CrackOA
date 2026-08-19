import api from './axiosInstance.js';

/**
 * Register a new account.
 */
export const registerApi = async (data) => {
  const response = await api.post('/auth/register', {
    name: data.name,
    email: data.email,
    password: data.password,
  });
  return response.data.data; // { user, token }
};

/**
 * Login with existing credentials.
 */
export const loginApi = async (data) => {
  const response = await api.post('/auth/login', {
    email: data.email,
    password: data.password,
  });
  return response.data.data; // { user, token }
};

/**
 * Request an OTP for email login.
 */
export const sendLoginOtpApi = async (email) => {
  const response = await api.post('/auth/otp/send-login', { email });
  return response.data;
};

/**
 * Verify OTP and login.
 */
export const verifyLoginOtpApi = async ({ email, otp }) => {
  const response = await api.post('/auth/otp/verify-login', { email, otp });
  return response.data.data; // { user, token }
};

/**
 * Request an OTP for password reset.
 */
export const sendForgotPasswordOtpApi = async (email) => {
  const response = await api.post('/auth/otp/forgot-password', { email });
  return response.data;
};

/**
 * Reset password using OTP.
 */
export const resetPasswordOtpApi = async ({ email, otp, newPassword }) => {
  const response = await api.post('/auth/otp/reset-password', { email, otp, newPassword });
  return response.data;
};

/**
 * Update user profile (name, email).
 */
export const updateProfileApi = async (data) => {
  const response = await api.patch('/auth/profile', data);
  return response.data.data.user;
};

/**
 * Change password.
 */
export const updatePasswordApi = async ({ currentPassword, newPassword }) => {
  const response = await api.put('/auth/update-password', { currentPassword, newPassword });
  return response.data;
};

/**
 * Logout.
 */
export const logoutApi = async () => {
  await api.post('/auth/logout');
};

/**
 * Fetch the currently authenticated user's profile.
 */
export const getMeApi = async () => {
  const response = await api.get('/auth/me');
  return response.data.data.user;
};
