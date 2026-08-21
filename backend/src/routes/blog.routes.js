import { Router } from 'express';
import { body } from 'express-validator';
import * as blogController from '../controllers/blog.controller.js';
import { protect, optionalProtect } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

const router = Router();

const blogValidation = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters.'),
  body('slug').trim().notEmpty().withMessage('Slug is required.').isSlug().withMessage('Invalid slug format.'),
  body('problem').isMongoId().withMessage('Valid problem ID is required.'),
  body('excerpt').trim().notEmpty().withMessage('Excerpt is required.'),
  body('content').isObject().withMessage('Content must be an object containing sections.'),
];

// 1. Static Public & User Read Routes (MUST be defined before /:slug wildcard)
router.get('/', blogController.getBlogs);
router.get('/my-blogs', protect, blogController.getUserBlogs);
router.get('/user/liked', protect, blogController.getUserLikedBlogs);

// 2. Specific Subpath Write/Delete Routes
router.delete('/comments/:commentId', protect, blogController.deleteComment);

// 3. User Article Write Routes
router.post('/', protect, blogValidation, validate, blogController.createBlog);
router.patch('/:id', protect, blogController.updateBlog);
router.delete('/:id', protect, blogController.deleteBlog);

// 4. ID-Based Interaction Routes
router.get('/:id/comments', blogController.getComments);
router.post('/:id/comments', protect, blogController.addComment);
router.post('/:id/like', protect, blogController.toggleLike);
router.get('/:id/like-status', optionalProtect, blogController.getLikeStatus);
router.post('/:id/report', protect, blogController.reportBlog);

// 5. Slug Wildcard Routes (MUST be defined last so static paths are not swallowed)
router.get('/:slug', optionalProtect, blogController.getBlogBySlug);
router.get('/:slug/related', optionalProtect, blogController.getRelatedBlogs);

export default router;


