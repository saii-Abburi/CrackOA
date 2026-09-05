import api from './axiosInstance.js';

/**
 * Submit user feedback.
 * @param {{ type: string, subject: string, message: string, rating?: number|null, page?: string }} data
 */
export const submitFeedbackApi = async (data) => {
  const response = await api.post('/feedback', data);
  return response.data;
};

/**
 * Admin: Get all feedback (paginated, filterable).
 * @param {{ page?: number, limit?: number, status?: string, type?: string }} params
 */
export const getAdminFeedbackApi = async (params = {}) => {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', params.page);
  if (params.limit) qs.set('limit', params.limit);
  if (params.status) qs.set('status', params.status);
  if (params.type) qs.set('type', params.type);
  const response = await api.get(`/admin/feedback?${qs.toString()}`);
  return { feedback: response.data.data.feedback, pagination: response.data.pagination };
};

/**
 * Admin: Update feedback status.
 * @param {string} id
 * @param {'new'|'reviewed'|'archived'} status
 */
export const updateFeedbackStatusApi = async (id, status) => {
  const response = await api.patch(`/admin/feedback/${id}/status`, { status });
  return response.data.data.feedback;
};
