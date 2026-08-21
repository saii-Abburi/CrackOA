import api from './axiosInstance';

// --- Public & User Endpoints ---

export const fetchBlogs = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/blogs${query ? `?${query}` : ''}`);
  return response.data;
};

export const fetchMyBlogs = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/blogs/my-blogs${query ? `?${query}` : ''}`);
  return response.data;
};

export const fetchBlogBySlug = async (slug) => {
  const response = await api.get(`/blogs/${slug}`);
  return response.data;
};

export const fetchRelatedBlogs = async (slug) => {
  const response = await api.get(`/blogs/${slug}/related`);
  return response.data;
};

export const createBlog = async (blogData) => {
  const response = await api.post('/blogs', blogData);
  return response.data;
};

export const updateBlog = async (id, updateData) => {
  const response = await api.patch(`/blogs/${id}`, updateData);
  return response.data;
};

export const deleteBlog = async (id) => {
  const response = await api.delete(`/blogs/${id}`);
  return response.data;
};

// --- Admin Endpoints ---

export const fetchAdminBlogs = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/admin/blogs${query ? `?${query}` : ''}`);
  return response.data;
};

export const fetchAdminBlogById = async (id) => {
  const response = await api.get(`/admin/blogs/${id}`);
  return response.data;
};

// --- Comments Endpoints ---

export const fetchBlogComments = async (blogId) => {
  const response = await api.get(`/blogs/${blogId}/comments`);
  return response.data;
};

export const addBlogComment = async (blogId, content) => {
  const response = await api.post(`/blogs/${blogId}/comments`, { content });
  return response.data;
};

export const deleteBlogComment = async (commentId) => {
  const response = await api.delete(`/blogs/comments/${commentId}`);
  return response.data;
};

// --- Persistent Likes Endpoints ---

export const toggleBlogLike = async (blogId) => {
  const response = await api.post(`/blogs/${blogId}/like`);
  return response.data;
};

export const fetchBlogLikeStatus = async (blogId) => {
  const response = await api.get(`/blogs/${blogId}/like-status`);
  return response.data;
};

export const fetchUserLikedBlogs = async () => {
  const response = await api.get('/blogs/user/liked');
  return response.data;
};

// --- Report & Moderation Endpoints ---

export const reportBlog = async (blogId, reason) => {
  const response = await api.post(`/blogs/${blogId}/report`, { reason });
  return response.data;
};

export const fetchAdminReports = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/admin/blogs/reports${query ? `?${query}` : ''}`);
  return response.data;
};

export const updateAdminReportStatus = async (reportId, status) => {
  const response = await api.patch(`/admin/blogs/reports/${reportId}`, { status });
  return response.data;
};

