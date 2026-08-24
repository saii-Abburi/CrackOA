import api from './axiosInstance';

/**
 * Fetch a single problem by ID/slug/leetcodeId.
 */
export const fetchProblemById = async (id) => {
  const response = await api.get(`/problems/${id}`);
  return response.data;
};

/**
 * Sync problem details & statement directly from LeetCode GraphQL
 */
export const syncProblemWithLeetCodeApi = async (id) => {
  const response = await api.post(`/problems/${id}/sync-leetcode`);
  return response.data;
};

/**
 * Preview LeetCode question data by query/slug/URL without saving
 */
export const previewLeetCodeApi = async (query) => {
  const response = await api.get('/problems/leetcode/preview', {
    params: { query }
  });
  return response.data;
};

/**
 * Execute code against test cases (Run Code)
 */
export const runCodeApi = async (id, { language, code, testCases }) => {
  const response = await api.post(`/problems/${id}/run`, { language, code, testCases });
  return response.data;
};

/**
 * Submit solution code (Submit)
 */
export const submitCodeApi = async (id, { language, code }) => {
  const response = await api.post(`/problems/${id}/submit`, { language, code });
  return response.data;
};

/**
 * Fetch user's submission history for a problem
 */
export const fetchSubmissionsApi = async (id) => {
  const response = await api.get(`/problems/${id}/submissions`);
  return response.data;
};

