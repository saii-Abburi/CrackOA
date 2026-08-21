import * as blogService from '../services/blog.service.js';
import { sendSuccess, sendError, buildPagination } from '../utils/apiResponse.js';

// --- PUBLIC CONTROLLERS ---

export const getBlogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search, topic, difficulty, problemId } = req.query;
    
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 12);
    
    const { blogs, total } = await blogService.getBlogs({
      page: parsedPage,
      limit: parsedLimit,
      search,
      topic,
      difficulty,
      problemId
    });
    
    return sendSuccess(res, 200, 'Blogs fetched successfully', blogs, {
      pagination: buildPagination(parsedPage, parsedLimit, total),
    });
  } catch (error) {
    next(error);
  }
};

export const getBlogBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    const blog = await blogService.getBlogBySlug(slug, req.user);
    
    if (!blog) {
      return sendError(res, 404, 'Blog not found', 'NOT_FOUND');
    }
    
    return sendSuccess(res, 200, 'Blog fetched successfully', blog);
  } catch (error) {
    next(error);
  }
};

export const getRelatedBlogs = async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    const currentBlog = await blogService.getBlogBySlug(slug, req.user);
    if (!currentBlog) {
      return sendError(res, 404, 'Blog not found', 'NOT_FOUND');
    }
    
    const related = await blogService.getRelatedBlogs(currentBlog, 4);
    
    return sendSuccess(res, 200, 'Related blogs fetched', related);
  } catch (error) {
    next(error);
  }
};

// --- USER CONTROLLERS ---

export const getUserBlogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 12);
    
    const { blogs, total } = await blogService.getUserBlogs({
      authorId: req.user._id,
      page: parsedPage,
      limit: parsedLimit,
    });
    
    return sendSuccess(res, 200, 'User blogs fetched successfully', blogs, {
      pagination: buildPagination(parsedPage, parsedLimit, total),
    });
  } catch (error) {
    next(error);
  }
};

// --- ADMIN CONTROLLERS ---

export const getAdminBlogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 20);
    
    const { blogs, total } = await blogService.getAdminBlogs({
      page: parsedPage,
      limit: parsedLimit,
    });
    
    return sendSuccess(res, 200, 'Admin blogs fetched successfully', blogs, {
      pagination: buildPagination(parsedPage, parsedLimit, total),
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminBlogById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await blogService.getBlogById(id);
    
    if (!blog) {
      return sendError(res, 404, 'Blog not found', 'NOT_FOUND');
    }
    
    return sendSuccess(res, 200, 'Blog fetched successfully', blog);
  } catch (error) {
    next(error);
  }
};

export const createBlog = async (req, res, next) => {
  try {
    const blog = await blogService.createBlog(req.body, req.user);
    
    return sendSuccess(res, 201, 'Blog created successfully', blog);
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 400, 'A blog with this slug or for this problem already exists.', 'DUPLICATE_ERROR');
    }
    next(error);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await blogService.updateBlog(id, req.body, req.user);
    
    if (result.error === 'NOT_FOUND') {
      return sendError(res, 404, result.message, 'NOT_FOUND');
    }
    if (result.error === 'FORBIDDEN') {
      return sendError(res, 403, result.message, 'FORBIDDEN');
    }
    
    return sendSuccess(res, 200, 'Blog updated successfully', result.blog);
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 400, 'A blog with this slug or for this problem already exists.', 'DUPLICATE_ERROR');
    }
    next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await blogService.deleteBlog(id, req.user);
    
    if (result.error === 'NOT_FOUND') {
      return sendError(res, 404, result.message, 'NOT_FOUND');
    }
    if (result.error === 'FORBIDDEN') {
      return sendError(res, 403, result.message, 'FORBIDDEN');
    }
    
    return sendSuccess(res, 200, 'Blog deleted successfully');
  } catch (error) {
    next(error);
  }
};

// --- COMMENTS CONTROLLERS ---

export const getComments = async (req, res, next) => {
  try {
    const { id } = req.params; // blog ID
    const comments = await blogService.getBlogComments(id);
    return sendSuccess(res, 200, 'Comments fetched successfully', comments);
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params; // blog ID
    const { content } = req.body;
    
    if (!content || !content.trim()) {
      return sendError(res, 400, 'Comment content is required', 'VALIDATION_ERROR');
    }

    const comment = await blogService.addBlogComment(id, req.user._id, content);
    return sendSuccess(res, 201, 'Comment added successfully', comment);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const result = await blogService.deleteBlogComment(commentId, req.user);

    if (result.error === 'NOT_FOUND') {
      return sendError(res, 404, result.message, 'NOT_FOUND');
    }
    if (result.error === 'FORBIDDEN') {
      return sendError(res, 403, result.message, 'FORBIDDEN');
    }

    return sendSuccess(res, 200, 'Comment deleted successfully');
  } catch (error) {
    next(error);
  }
};

// --- PERSISTENT LIKES CONTROLLERS ---

export const toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params; // blog ID
    const result = await blogService.toggleBlogLike(id, req.user._id);

    if (result.error === 'NOT_FOUND') {
      return sendError(res, 404, result.message, 'NOT_FOUND');
    }

    return sendSuccess(res, 200, result.liked ? 'Blog liked' : 'Blog unliked', result);
  } catch (error) {
    next(error);
  }
};

export const getLikeStatus = async (req, res, next) => {
  try {
    const { id } = req.params; // blog ID
    const userId = req.user ? req.user._id : null;
    const result = await blogService.getBlogLikeStatus(id, userId);

    if (result.error === 'NOT_FOUND') {
      return sendError(res, 404, result.message, 'NOT_FOUND');
    }

    return sendSuccess(res, 200, 'Like status fetched successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getUserLikedBlogs = async (req, res, next) => {
  try {
    const likedBlogs = await blogService.getUserLikedBlogs(req.user._id);
    return sendSuccess(res, 200, 'User liked blogs fetched', likedBlogs);
  } catch (error) {
    next(error);
  }
};

// --- REPORT & MODERATION CONTROLLERS ---

export const reportBlog = async (req, res, next) => {
  try {
    const { id } = req.params; // blog ID
    const { reason } = req.body;

    const report = await blogService.createBlogReport(id, req.user._id, reason);
    return sendSuccess(res, 201, 'Blog report submitted successfully', report);
  } catch (error) {
    next(error);
  }
};

export const getAdminReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 20);

    const { reports, total } = await blogService.getAdminReports({
      page: parsedPage,
      limit: parsedLimit,
    });

    return sendSuccess(res, 200, 'Admin reports fetched successfully', reports, {
      pagination: buildPagination(parsedPage, parsedLimit, total),
    });
  } catch (error) {
    next(error);
  }
};

export const updateReportStatus = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;

    if (!['reviewed', 'dismissed', 'pending'].includes(status)) {
      return sendError(res, 400, 'Invalid report status', 'VALIDATION_ERROR');
    }

    const result = await blogService.updateAdminReportStatus(reportId, status);

    if (result.error === 'NOT_FOUND') {
      return sendError(res, 404, result.message, 'NOT_FOUND');
    }

    return sendSuccess(res, 200, 'Report status updated', result.report);
  } catch (error) {
    next(error);
  }
};

