import { Router } from 'express';
import { body, param } from 'express-validator';
import * as platformController from '../controllers/platform.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

const router = Router();

// All routes require authentication
router.use(protect);

// ── Validation ────────────────────────────────────────────────────

const PLATFORM_ENUM = ['leetcode', 'codeforces', 'geeksforgeeks'];

const platformBodyRules = [
  body('platform')
    .trim()
    .notEmpty()
    .withMessage('Platform is required.')
    .isIn(PLATFORM_ENUM)
    .withMessage(`Platform must be one of: ${PLATFORM_ENUM.join(', ')}.`),
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required.')
    .isLength({ min: 1, max: 100 })
    .withMessage('Username must be between 1 and 100 characters.')
    .matches(/^[a-zA-Z0-9_.\-]+$/)
    .withMessage('Username may only contain letters, numbers, underscores, hyphens, or dots.'),
];

const usernameUpdateRules = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required.')
    .isLength({ min: 1, max: 100 })
    .withMessage('Username must be between 1 and 100 characters.')
    .matches(/^[a-zA-Z0-9_.\-]+$/)
    .withMessage('Username may only contain letters, numbers, underscores, hyphens, or dots.'),
];

const platformParamRules = [
  param('platform')
    .trim()
    .isIn(PLATFORM_ENUM)
    .withMessage(`Platform must be one of: ${PLATFORM_ENUM.join(', ')}.`),
];

// ── Routes ────────────────────────────────────────────────────────

/**
 * GET /api/platforms
 * List all connected platform accounts for the current user.
 */
router.get('/', platformController.getPlatformAccounts);

/**
 * POST /api/platforms
 * Connect a new platform account.
 */
router.post('/', platformBodyRules, validate, platformController.addPlatformAccount);

/**
 * PATCH /api/platforms/:platform
 * Update the username for an existing platform connection.
 */
router.patch(
  '/:platform',
  platformParamRules,
  usernameUpdateRules,
  validate,
  platformController.updatePlatformAccount
);

/**
 * DELETE /api/platforms/:platform
 * Disconnect a platform account.
 */
router.delete(
  '/:platform',
  platformParamRules,
  validate,
  platformController.removePlatformAccount
);

/**
 * POST /api/platforms/:platform/sync
 * Manually trigger a stats re-sync (rate-limited in the service layer).
 */
router.post(
  '/:platform/sync',
  platformParamRules,
  validate,
  platformController.syncPlatformAccount
);

export default router;
