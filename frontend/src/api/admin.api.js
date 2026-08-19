import api from './axiosInstance.js';

/**
 * Admin API calls — restricted to role === 'admin'.
 */

export const getAdminStatsApi = async () => {
  const response = await api.get('/admin/stats');
  return response.data.data;
};

export const bulkImportProblemsApi = async (problems, targetCompany = null) => {
  const response = await api.post('/admin/problems/bulk-import', { problems, targetCompany });
  return response.data.data;
};

export const createCompanyApi = async (data) => {
  const response = await api.post('/admin/companies', data);
  return response.data.data;
};

export const updateCompanyApi = async (id, data) => {
  const response = await api.patch(`/admin/companies/${id}`, data);
  return response.data.data;
};

export const deleteCompanyApi = async (id) => {
  const response = await api.delete(`/admin/companies/${id}`);
  return response.data.data;
};

export const createProblemApi = async (data) => {
  const response = await api.post('/admin/problems', data);
  return response.data.data;
};

export const updateProblemApi = async (id, data) => {
  const response = await api.patch(`/admin/problems/${id}`, data);
  return response.data.data;
};

export const deleteProblemApi = async (id) => {
  const response = await api.delete(`/admin/problems/${id}`);
  return response.data.data;
};
