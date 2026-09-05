import { Router } from 'express';
import { query } from 'express-validator';
import * as companyController from '../controllers/company.controller.js';
import { slugParam, problemQueryRules } from '../middleware/validators.js';
import validate from '../middleware/validate.middleware.js';

const router = Router();

// GET /api/companies
router.get(
  '/',
  [
    query('search')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 100 })
      .withMessage('Search query cannot exceed 100 characters.'),
  ],
  validate,
  companyController.getAllCompanies
);

// GET /api/companies/:slug
router.get(
  '/:slug',
  slugParam('slug', 'Company slug'),
  validate,
  companyController.getCompany
);

// GET /api/companies/:slug/problems
router.get(
  '/:slug/problems',
  slugParam('slug', 'Company slug'),
  problemQueryRules,
  validate,
  companyController.getCompanyProblems
);

export default router;

