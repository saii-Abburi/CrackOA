import { Router } from 'express';
import { query } from 'express-validator';
import * as problemController from '../controllers/problem.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import {
  mongoIdParam,
  problemIdParam,
  problemQueryRules,
  codeExecutionRules
} from '../middleware/validators.js';
import validate from '../middleware/validate.middleware.js';

const router = Router();

// GET /api/problems — list with filters, sorting, pagination, domain
router.get('/', problemQueryRules, validate, problemController.getAllProblems);

// GET /api/problems/leetcode/preview — admin preview from LeetCode
router.get(
  '/leetcode/preview',
  [
    query('query').optional({ checkFalsy: true }).trim().isLength({ max: 300 }).withMessage('Query cannot exceed 300 characters.'),
    query('slug').optional({ checkFalsy: true }).trim().isLength({ max: 300 }).withMessage('Slug cannot exceed 300 characters.'),
    query('url').optional({ checkFalsy: true }).trim().isLength({ max: 500 }).withMessage('URL cannot exceed 500 characters.'),
  ],
  validate,
  problemController.previewLeetCode
);

// GET /api/problems/:id — accepts MongoDB ObjectId, leetcodeId (number), or slug
router.get(
  '/:id',
  problemIdParam('id', 'Problem ID'),
  validate,
  problemController.getProblem
);

// GET /api/problems/:id/companies
router.get(
  '/:id/companies',
  problemIdParam('id', 'Problem ID'),
  validate,
  problemController.getProblemCompanies
);

// POST/GET /api/problems/:id/sync-leetcode (Admin only — DSA problems only)
router.post(
  '/:id/sync-leetcode',
  protect,
  restrictTo('admin'),
  mongoIdParam('id', 'Problem ID'),
  validate,
  problemController.syncProblemWithLeetCode
);
router.get(
  '/:id/sync-leetcode',
  protect,
  restrictTo('admin'),
  mongoIdParam('id', 'Problem ID'),
  validate,
  problemController.syncProblemWithLeetCode
);

// POST /api/problems/:id/run — accepts slug or ObjectId (works for DSA and SQL)
router.post(
  '/:id/run',
  problemIdParam('id', 'Problem ID'),
  codeExecutionRules,
  validate,
  problemController.runCode
);

// POST /api/problems/:id/submit — requires auth
router.post(
  '/:id/submit',
  protect,
  problemIdParam('id', 'Problem ID'),
  codeExecutionRules,
  validate,
  problemController.submitCode
);

// GET /api/problems/:id/submissions — requires auth
router.get(
  '/:id/submissions',
  protect,
  problemIdParam('id', 'Problem ID'),
  validate,
  problemController.getSubmissions
);

export default router;
