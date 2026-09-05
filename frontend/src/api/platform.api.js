import api from './axiosInstance.js';

/**
 * Get all connected platform accounts for the current user.
 * @returns {Promise<Array>} array of PlatformAccount objects (with profileUrl)
 */
export const getPlatformAccountsApi = async () => {
  const response = await api.get('/platforms');
  return response.data.data.accounts;
};

/**
 * Connect a new platform account.
 * @param {{ platform: string, username: string }} data
 * @returns {Promise<Object>} the new PlatformAccount object
 */
export const addPlatformAccountApi = async ({ platform, username }) => {
  const response = await api.post('/platforms', { platform, username });
  return response.data.data.account;
};

/**
 * Update the username for an existing platform account.
 * @param {string} platform - 'leetcode' | 'codeforces' | 'geeksforgeeks'
 * @param {string} username
 * @returns {Promise<Object>} the updated PlatformAccount object
 */
export const updatePlatformAccountApi = async (platform, username) => {
  const response = await api.patch(`/platforms/${platform}`, { username });
  return response.data.data.account;
};

/**
 * Disconnect a platform account.
 * @param {string} platform
 */
export const removePlatformAccountApi = async (platform) => {
  await api.delete(`/platforms/${platform}`);
};

/**
 * Manually trigger a stats re-sync for a platform.
 * @param {string} platform
 * @returns {Promise<Object>} the updated PlatformAccount object
 */
export const syncPlatformAccountApi = async (platform) => {
  const response = await api.post(`/platforms/${platform}/sync`);
  return response.data.data.account;
};
