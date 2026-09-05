import { Router } from 'express';
import { body } from 'express-validator';
import * as companyController from '../controllers/company.controller.js';
import * as problemController from '../controllers/problem.controller.js';
import * as blogController from '../controllers/blog.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(protect, restrictTo('admin'));

import { mongoIdParam, paginationQueryRules, blogValidationRules } from '../middleware/validators.js';

// ----- Company Admin Routes -----

const companyValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Company name is required.')
    .isLength({ min: 1, max: 100 })
    .withMessage('Company name cannot exceed 100 characters.'),
  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters.'),
  body('logo')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Logo must be a valid URL.')
    .isLength({ max: 500 })
    .withMessage('Logo URL cannot exceed 500 characters.'),
];

const companyUpdateValidation = [
  ...mongoIdParam('id', 'Company ID'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Company name cannot be empty.')
    .isLength({ min: 1, max: 100 })
    .withMessage('Company name cannot exceed 100 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters.'),
  body('logo')
    .optional()
    .trim()
    .isURL()
    .withMessage('Logo must be a valid URL.')
    .isLength({ max: 500 })
    .withMessage('Logo URL cannot exceed 500 characters.'),
];

router.post('/companies', companyValidation, validate, companyController.createCompany);
router.patch('/companies/:id', companyUpdateValidation, validate, companyController.updateCompany);
router.delete('/companies/:id', mongoIdParam('id', 'Company ID'), validate, companyController.deleteCompany);

// ----- Problem Admin Routes -----

const problemValidation = [
  body('domain')
    .optional({ checkFalsy: true })
    .isIn(['dsa', 'sql'])
    .withMessage('Domain must be dsa or sql.'),
  body('leetcodeId')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('LeetCode ID must be a positive integer.'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required.')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title cannot exceed 200 characters.'),
  body('difficulty')
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be Easy, Medium, or Hard.'),
  body('acceptanceRate')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 100 })
    .withMessage('Acceptance rate must be between 0 and 100.'),
  body('frequency')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Frequency must be a non-negative number.'),
  body('leetcodeUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('LeetCode URL must be a valid URL.')
    .isLength({ max: 500 })
    .withMessage('LeetCode URL cannot exceed 500 characters.'),
  body('topics')
    .optional()
    .isArray({ max: 30 })
    .withMessage('Topics must be an array with at most 30 items.'),
  body('topics.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Topic string cannot exceed 50 characters.'),
  body('companies')
    .optional()
    .isArray({ max: 50 })
    .withMessage('Companies must be an array of company IDs.'),
  body('companies.*')
    .optional()
    .isMongoId()
    .withMessage('Each company reference must be a valid MongoDB ObjectId.'),
  body('solutionUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Solution URL must be a valid URL.')
    .isLength({ max: 500 })
    .withMessage('Solution URL cannot exceed 500 characters.'),
  // ── SQL-specific fields ────────────────────────────────────────────────────
  body('sqlMeta.schemaDescription')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Schema description must be a string.')
    .isLength({ max: 20000 })
    .withMessage('Schema description cannot exceed 20,000 characters.'),
  body('sqlMeta.expectedOutput')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Expected output must be a string.')
    .isLength({ max: 10000 })
    .withMessage('Expected output cannot exceed 10,000 characters.'),
  body('sqlMeta.explanation')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Explanation must be a string.')
    .isLength({ max: 20000 })
    .withMessage('Explanation cannot exceed 20,000 characters.'),
  body('sqlMeta.referenceQuery')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Reference query must be a string.')
    .isLength({ max: 10000 })
    .withMessage('Reference query cannot exceed 10,000 characters.'),
  body('sqlMeta.constraints')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Constraints must be an array with at most 20 items.'),
  body('sqlMeta.sampleTables')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Sample tables must be an array with at most 10 items.'),
  body('sqlMeta.testCases')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Test cases must be an array with at most 20 items.'),
];

const problemUpdateValidation = [
  ...mongoIdParam('id', 'Problem ID'),
  body('domain')
    .optional()
    .isIn(['dsa', 'sql'])
    .withMessage('Domain must be dsa or sql.'),
  body('leetcodeId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('LeetCode ID must be a positive integer.'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty.')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title cannot exceed 200 characters.'),
  body('difficulty')
    .optional()
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be Easy, Medium, or Hard.'),
  body('acceptanceRate')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 100 })
    .withMessage('Acceptance rate must be between 0 and 100.'),
  body('frequency')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Frequency must be a non-negative number.'),
  body('leetcodeUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('LeetCode URL must be a valid URL.')
    .isLength({ max: 500 })
    .withMessage('LeetCode URL cannot exceed 500 characters.'),
  body('topics')
    .optional()
    .isArray({ max: 30 })
    .withMessage('Topics must be an array with at most 30 items.'),
  body('companies')
    .optional()
    .isArray({ max: 50 })
    .withMessage('Companies must be an array of company IDs.'),
  body('companies.*')
    .optional()
    .isMongoId()
    .withMessage('Each company reference must be a valid MongoDB ObjectId.'),
  body('solutionUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Solution URL must be a valid URL.')
    .isLength({ max: 500 })
    .withMessage('Solution URL cannot exceed 500 characters.'),
  // ── SQL-specific fields ────────────────────────────────────────────────────
  body('sqlMeta.schemaDescription')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Schema description must be a string.')
    .isLength({ max: 20000 })
    .withMessage('Schema description cannot exceed 20,000 characters.'),
  body('sqlMeta.expectedOutput')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Expected output must be a string.')
    .isLength({ max: 10000 })
    .withMessage('Expected output cannot exceed 10,000 characters.'),
  body('sqlMeta.explanation')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Explanation must be a string.')
    .isLength({ max: 20000 })
    .withMessage('Explanation cannot exceed 20,000 characters.'),
  body('sqlMeta.referenceQuery')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Reference query must be a string.')
    .isLength({ max: 10000 })
    .withMessage('Reference query cannot exceed 10,000 characters.'),
  body('sqlMeta.constraints')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Constraints must be an array with at most 20 items.'),
  body('sqlMeta.sampleTables')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Sample tables must be an array with at most 10 items.'),
  body('sqlMeta.testCases')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Test cases must be an array with at most 20 items.'),
];

const bulkImportValidation = [
  body('problems')
    .isArray({ min: 1, max: 1000 })
    .withMessage('problems must be a non-empty array with at most 1000 items.'),
  body('targetCompany')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('targetCompany cannot exceed 100 characters.'),
];

router.post('/problems', problemValidation, validate, problemController.createProblem);
router.post('/problems/bulk-import', bulkImportValidation, validate, problemController.bulkImportProblems);
router.post('/problems/sync-all-leetcode', problemController.syncAllProblemsWithLeetCode);
router.patch('/problems/:id', problemUpdateValidation, validate, problemController.updateProblem);
router.delete('/problems/:id', mongoIdParam('id', 'Problem ID'), validate, problemController.deleteProblem);

// ----- Blog Admin Routes -----

router.get('/blogs', paginationQueryRules, validate, blogController.getAdminBlogs);
router.get('/blogs/reports', paginationQueryRules, validate, blogController.getAdminReports);
router.patch(
  '/blogs/reports/:reportId',
  mongoIdParam('reportId', 'Report ID'),
  [
    body('status')
      .trim()
      .notEmpty()
      .withMessage('Status is required.')
      .isIn(['reviewed', 'dismissed', 'pending'])
      .withMessage('Status must be reviewed, dismissed, or pending.'),
  ],
  validate,
  blogController.updateReportStatus
);
router.get('/blogs/:id', mongoIdParam('id', 'Blog ID'), validate, blogController.getAdminBlogById);
router.post('/blogs', blogValidationRules, validate, blogController.createBlog);
router.patch(
  '/blogs/:id',
  mongoIdParam('id', 'Blog ID'),
  blogValidationRules,
  validate,
  blogController.updateBlog
);
router.delete('/blogs/:id', mongoIdParam('id', 'Blog ID'), validate, blogController.deleteBlog);

// ----- Admin Stats Route -----
router.get('/stats', async (req, res, next) => {
  try {
    const [User, Company, Problem, UserProgress] = await Promise.all([
      import('../models/User.js').then((m) => m.default),
      import('../models/Company.js').then((m) => m.default),
      import('../models/Problem.js').then((m) => m.default),
      import('../models/UserProgress.js').then((m) => m.default),
    ]);

    const [totalUsers, totalCompanies, totalProblems, totalDsaProblems, totalSqlProblems, totalProgress] = await Promise.all([
      User.countDocuments(),
      Company.countDocuments(),
      Problem.countDocuments(),
      Problem.countDocuments({ domain: 'dsa' }),
      Problem.countDocuments({ domain: 'sql' }),
      UserProgress.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Admin stats fetched.',
      data: {
        totalUsers,
        totalCompanies,
        totalProblems,
        totalDsaProblems,
        totalSqlProblems,
        totalProgress,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
