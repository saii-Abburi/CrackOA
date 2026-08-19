import * as problemService from '../services/problem.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

/**
 * GET /api/problems
 */
export const getAllProblems = async (req, res, next) => {
  try {
    const { problems, pagination } = await problemService.getAllProblems(req.query);
    return sendSuccess(res, 200, 'Problems fetched successfully.', problems, { pagination });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/problems/:id
 */
export const getProblem = async (req, res, next) => {
  try {
    const problem = await problemService.getProblemById(req.params.id);
    return sendSuccess(res, 200, 'Problem fetched successfully.', problem);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/problems/:id/companies
 */
export const getProblemCompanies = async (req, res, next) => {
  try {
    const companies = await problemService.getProblemCompanies(req.params.id);
    return sendSuccess(res, 200, 'Problem companies fetched successfully.', companies);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/problems
 */
export const createProblem = async (req, res, next) => {
  try {
    const problem = await problemService.createProblem(req.body);
    return sendSuccess(res, 201, 'Problem created successfully.', problem);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/problems/:id
 */
export const updateProblem = async (req, res, next) => {
  try {
    const problem = await problemService.updateProblem(req.params.id, req.body);
    return sendSuccess(res, 200, 'Problem updated successfully.', problem);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/problems/:id
 */
export const deleteProblem = async (req, res, next) => {
  try {
    await problemService.deleteProblem(req.params.id);
    return sendSuccess(res, 200, 'Problem deleted successfully.', null);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/problems/bulk-import
 */
export const bulkImportProblems = async (req, res, next) => {
  try {
    const { problems, targetCompany } = req.body;
    if (!Array.isArray(problems) || problems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body must contain a non-empty "problems" array.',
        error: { code: 'INVALID_INPUT' },
      });
    }

    const result = await problemService.bulkImportProblems(problems, targetCompany);
    return sendSuccess(res, 200, 'CSV import completed.', result);
  } catch (error) {
    next(error);
  }
};

