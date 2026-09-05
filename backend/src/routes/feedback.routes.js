import { Router } from 'express';
import { body, query } from 'express-validator';
import Feedback from '../models/Feedback.js';
import { protect } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { generalLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

// ── Validation ───────────────────────────────────────────────────

const submitFeedbackRules = [
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Feedback type is required.')
    .isIn(['bug', 'feature', 'content', 'general'])
    .withMessage('Type must be bug, feature, content, or general.'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required.')
    .isLength({ max: 150 })
    .withMessage('Subject cannot exceed 150 characters.'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required.')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters.'),
  body('rating')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5.'),
  body('page')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 300 })
    .withMessage('Page URL cannot exceed 300 characters.'),
];

// ── Routes ───────────────────────────────────────────────────────

/**
 * POST /api/feedback
 * Submit feedback. User must be logged in (optional guest support can be enabled later).
 * Rate limited: 10 req / 15 min per IP.
 */
router.post(
  '/',
  generalLimiter,
  protect,
  submitFeedbackRules,
  validate,
  async (req, res, next) => {
    try {
      const { type, subject, message, rating, page } = req.body;
      const feedback = await Feedback.create({
        user: req.user._id,
        type,
        subject: subject.trim(),
        message: message.trim(),
        rating: rating ?? null,
        page: page?.trim() || null,
      });

      return sendSuccess(res, 201, 'Thank you for your feedback!', {
        id: feedback._id,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
