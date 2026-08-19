import { Router } from 'express';
import * as companyController from '../controllers/company.controller.js';

const router = Router();

// GET /api/companies
router.get('/', companyController.getAllCompanies);

// GET /api/companies/:slug
router.get('/:slug', companyController.getCompany);

// GET /api/companies/:slug/problems
router.get('/:slug/problems', companyController.getCompanyProblems);

export default router;
