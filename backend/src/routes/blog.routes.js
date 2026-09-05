import { Router } from 'express';
import * as blogController from '../controllers/blog.controller.js';
import { protect, optionalProtect } from '../middleware/auth.middleware.js';
import {
  mongoIdParam,
  slugParam,
  blogQueryRules,
  paginationQueryRules,
  blogValidationRules,
  commentRules,
  reportRules,
} from '../middleware/validators.js';
import validate from '../middleware/validate.middleware.js';

const router = Router();

// 1. Static Public & User Read Routes (MUST be defined before /:slug wildcard)
router.get('/', blogQueryRules, validate, blogController.getBlogs);
router.get('/my-blogs', protect, paginationQueryRules, validate, blogController.getUserBlogs);
router.get('/user/liked', protect, blogController.getUserLikedBlogs);

// 2. Specific Subpath Write/Delete Routes
router.delete(
  '/comments/:commentId',
  protect,
  mongoIdParam('commentId', 'Comment ID'),
  validate,
  blogController.deleteComment
);

// 3. User Article Write Routes
router.post('/', protect, blogValidationRules, validate, blogController.createBlog);
router.patch(
  '/:id',
  protect,
  mongoIdParam('id', 'Blog ID'),
  blogValidationRules,
  validate,
  blogController.updateBlog
);
router.delete(
  '/:id',
  protect,
  mongoIdParam('id', 'Blog ID'),
  validate,
  blogController.deleteBlog
);

// 4. ID-Based Interaction Routes
router.get('/:id/comments', mongoIdParam('id', 'Blog ID'), validate, blogController.getComments);
router.post(
  '/:id/comments',
  protect,
  mongoIdParam('id', 'Blog ID'),
  commentRules,
  validate,
  blogController.addComment
);
router.post('/:id/like', protect, mongoIdParam('id', 'Blog ID'), validate, blogController.toggleLike);
router.get('/:id/like-status', optionalProtect, mongoIdParam('id', 'Blog ID'), validate, blogController.getLikeStatus);
router.post(
  '/:id/report',
  protect,
  mongoIdParam('id', 'Blog ID'),
  reportRules,
  validate,
  blogController.reportBlog
);

// 5. Slug Wildcard Routes (MUST be defined last so static paths are not swallowed)
router.get('/:slug', optionalProtect, slugParam('slug', 'Blog slug'), validate, blogController.getBlogBySlug);
router.get('/:slug/related', optionalProtect, slugParam('slug', 'Blog slug'), validate, blogController.getRelatedBlogs);

export default router;



