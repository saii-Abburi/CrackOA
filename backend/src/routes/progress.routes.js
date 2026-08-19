import { Router } from 'express';
import { body } from 'express-validator';
import * as progressController from '../controllers/progress.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

const router = Router();

// All progress routes require authentication
router.use(protect);

// Validation for progress upsert
const progressValidation = [
  body('status')
    .optional()
    .isIn(['not_started', 'attempted', 'solved'])
    .withMessage('Status must be not_started, attempted, or solved.'),
  body('notes')
    .optional()
    .isString()
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters.'),
];

// GET /api/progress — all progress for the user
router.get('/', progressController.getUserProgress);

// GET /api/progress/:problemId
router.get('/:problemId', progressController.getProgressByProblem);

// POST /api/progress/:problemId — create or update
router.post('/:problemId', progressValidation, validate, progressController.upsertProgress);

// PATCH /api/progress/:problemId — update
router.patch('/:problemId', progressValidation, validate, progressController.updateProgress);

// DELETE /api/progress/:problemId
router.delete('/:problemId', progressController.deleteProgress);

export default router;
