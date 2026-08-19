import api from './axiosInstance.js';

/**
 * Fetch all progress records for the authenticated user.
 * Returns an array of progress objects with populated problem data.
 */
export const fetchUserProgress = async () => {
  const res = await api.get('/progress');
  return res.data.data; // array of progress records
};

/**
 * Create or update progress for a specific problem.
 * @param {string} problemId - MongoDB ObjectId of the problem
 * @param {object} data - { status: 'solved' | 'attempted' | 'not_started', notes?: string }
 */
export const upsertProgress = async (problemId, data) => {
  const res = await api.post(`/progress/${problemId}`, data);
  return res.data.data;
};

/**
 * Delete a progress record for a specific problem.
 * @param {string} problemId - MongoDB ObjectId of the problem
 */
export const deleteProgress = async (problemId) => {
  const res = await api.delete(`/progress/${problemId}`);
  return res.data;
};

/**
 * Fetch dashboard statistics for the authenticated user.
 * Returns: { totalProblems, solvedProblems, attemptedProblems, easySolved, ... companyProgress[] }
 */
export const fetchDashboard = async () => {
  const res = await api.get('/dashboard');
  return res.data.data;
};
