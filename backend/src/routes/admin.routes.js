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

// ----- Company Admin Routes -----

const companyValidation = [
  body('name').trim().notEmpty().withMessage('Company name is required.').isLength({ max: 100 }).withMessage('Company name cannot exceed 100 characters.'),
  body('description').optional({ checkFalsy: true }).isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters.'),
  body('logo').optional({ checkFalsy: true }).isURL().withMessage('Logo must be a valid URL.'),
];

router.post('/companies', companyValidation, validate, companyController.createCompany);
router.patch('/companies/:id', companyController.updateCompany);
router.delete('/companies/:id', companyController.deleteCompany);

// ----- Problem Admin Routes -----

const problemValidation = [
  body('leetcodeId').isInt({ min: 1 }).withMessage('LeetCode ID must be a positive integer.'),
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters.'),
  body('difficulty').isIn(['Easy', 'Medium', 'Hard']).withMessage('Difficulty must be Easy, Medium, or Hard.'),
  body('acceptanceRate').optional({ checkFalsy: true }).isFloat({ min: 0, max: 100 }).withMessage('Acceptance rate must be between 0 and 100.'),
  body('frequency').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Frequency must be a non-negative number.'),
  body('leetcodeUrl').optional({ checkFalsy: true }).isURL().withMessage('LeetCode URL must be a valid URL.'),
  body('topics').optional().isArray().withMessage('Topics must be an array.'),
  body('companies').optional().isArray().withMessage('Companies must be an array.'),
  body('solutionUrl').optional({ checkFalsy: true }).isURL().withMessage('Solution URL must be a valid URL.'),
];

router.post('/problems', problemValidation, validate, problemController.createProblem);
router.post('/problems/bulk-import', problemController.bulkImportProblems);
router.patch('/problems/:id', problemController.updateProblem);
router.delete('/problems/:id', problemController.deleteProblem);

// ----- Blog Admin Routes -----

const blogValidation = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters.'),
  body('slug').trim().notEmpty().withMessage('Slug is required.').isSlug().withMessage('Invalid slug format.'),
  body('problem').isMongoId().withMessage('Valid problem ID is required.'),
  body('excerpt').trim().notEmpty().withMessage('Excerpt is required.'),
  body('content').isObject().withMessage('Content must be an object containing sections.'),
];

router.get('/blogs', blogController.getAdminBlogs);
router.get('/blogs/reports', blogController.getAdminReports);
router.patch('/blogs/reports/:reportId', blogController.updateReportStatus);
router.get('/blogs/:id', blogController.getAdminBlogById);
router.post('/blogs', blogValidation, validate, blogController.createBlog);
router.patch('/blogs/:id', blogController.updateBlog); // Validation omitted for brevity on partial updates, can be added later
router.delete('/blogs/:id', blogController.deleteBlog);

// ----- Admin Stats Route -----
router.get('/stats', async (req, res, next) => {
  try {
    const [User, Company, Problem, UserProgress] = await Promise.all([
      import('../models/User.js').then((m) => m.default),
      import('../models/Company.js').then((m) => m.default),
      import('../models/Problem.js').then((m) => m.default),
      import('../models/UserProgress.js').then((m) => m.default),
    ]);

    const [totalUsers, totalCompanies, totalProblems, totalProgress] = await Promise.all([
      User.countDocuments(),
      Company.countDocuments(),
      Problem.countDocuments(),
      UserProgress.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Admin stats fetched.',
      data: {
        totalUsers,
        totalCompanies,
        totalProblems,
        totalProgress,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
