import * as progressService from '../services/progress.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

/**
 * POST /api/progress/:problemId
 * Create or update progress for a problem.
 */
export const upsertProgress = async (req, res, next) => {
  try {
    const progress = await progressService.upsertProgress(
      req.user._id,
      req.params.problemId,
      req.body
    );
    return sendSuccess(res, 200, 'Progress saved successfully.', progress);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/progress
 * Get all progress for the authenticated user.
 */
export const getUserProgress = async (req, res, next) => {
  try {
    const progress = await progressService.getUserProgress(req.user._id);
    return sendSuccess(res, 200, 'Progress fetched successfully.', progress);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/progress/:problemId
 * Get progress for a specific problem.
 */
export const getProgressByProblem = async (req, res, next) => {
  try {
    const progress = await progressService.getProgressByProblem(
      req.user._id,
      req.params.problemId
    );
    return sendSuccess(res, 200, 'Problem progress fetched successfully.', progress);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/progress/:problemId
 * Update notes or status on an existing progress record.
 */
export const updateProgress = async (req, res, next) => {
  try {
    const progress = await progressService.upsertProgress(
      req.user._id,
      req.params.problemId,
      req.body
    );
    return sendSuccess(res, 200, 'Progress updated successfully.', progress);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/progress/:problemId
 * Delete a progress record.
 */
export const deleteProgress = async (req, res, next) => {
  try {
    await progressService.deleteProgress(req.user._id, req.params.problemId);
    return sendSuccess(res, 200, 'Progress deleted successfully.', null);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard
 * Get dashboard statistics for the authenticated user.
 */
export const getDashboard = async (req, res, next) => {
  try {
    const stats = await progressService.getDashboardStats(req.user._id);
    return sendSuccess(res, 200, 'Dashboard stats fetched successfully.', stats);
  } catch (error) {
    next(error);
  }
};
