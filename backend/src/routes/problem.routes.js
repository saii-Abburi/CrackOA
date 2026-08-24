import { Router } from 'express';
import * as problemController from '../controllers/problem.controller.js';

const router = Router();

// GET /api/problems
router.get('/', problemController.getAllProblems);

// GET /api/problems/leetcode/preview
router.get('/leetcode/preview', problemController.previewLeetCode);

// GET /api/problems/:id
router.get('/:id', problemController.getProblem);

// GET /api/problems/:id/companies
router.get('/:id/companies', problemController.getProblemCompanies);

// POST /api/problems/:id/sync-leetcode
router.post('/:id/sync-leetcode', problemController.syncProblemWithLeetCode);
router.get('/:id/sync-leetcode', problemController.syncProblemWithLeetCode);

// Code execution & submissions
router.post('/:id/run', problemController.runCode);
router.post('/:id/submit', problemController.submitCode);
router.get('/:id/submissions', problemController.getSubmissions);

export default router;


