import { Router } from 'express';
import * as problemController from '../controllers/problem.controller.js';

const router = Router();

// GET /api/problems
router.get('/', problemController.getAllProblems);

// GET /api/problems/:id
router.get('/:id', problemController.getProblem);

// GET /api/problems/:id/companies
router.get('/:id/companies', problemController.getProblemCompanies);

export default router;
