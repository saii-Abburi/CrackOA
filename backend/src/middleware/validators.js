import { param, query, body } from 'express-validator';

/**
 * Reusable validation chains and rules for Express routes.
 */

// ── Route Parameter Validators ─────────────────────────────────────────

export const mongoIdParam = (paramName = 'id', label = 'ID') => [
  param(paramName)
    .trim()
    .notEmpty()
    .withMessage(`${label} is required.`)
    .isMongoId()
    .withMessage(`Invalid ${label} format. Must be a valid MongoDB ObjectId.`),
];

export const slugParam = (paramName = 'slug', label = 'Slug') => [
  param(paramName)
    .trim()
    .notEmpty()
    .withMessage(`${label} is required.`)
    .isLength({ min: 1, max: 200 })
    .withMessage(`${label} must be between 1 and 200 characters.`)
    .matches(/^[a-zA-Z0-9-_]+$/)
    .withMessage(`${label} can only contain alphanumeric characters, underscores, and hyphens.`),
];

/**
 * Flexible problem ID param: accepts MongoDB ObjectId OR a slug string.
 * Used on problem routes so SQL problems (accessed by slug) work alongside
 * DSA problems (accessed by leetcodeId or ObjectId).
 */
export const problemIdParam = (paramName = 'id', label = 'Problem ID') => [
  param(paramName)
    .trim()
    .notEmpty()
    .withMessage(`${label} is required.`)
    .isLength({ min: 1, max: 300 })
    .withMessage(`${label} is too long.`),
  // Allow any non-empty string — validation of existence happens at service layer
];

// ── Query Parameter Validators ─────────────────────────────────────────

export const paginationQueryRules = [
  query('page')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer.')
    .toInt(),
  query('limit')
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100.')
    .toInt(),
];

export const problemQueryRules = [
  query('page')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer.')
    .toInt(),
  query('limit')
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 500 })
    .withMessage('Limit must be an integer between 1 and 500.')
    .toInt(),
  query('difficulty')
    .optional({ checkFalsy: true })
    .isIn(['Easy', 'Medium', 'Hard', 'All'])
    .withMessage('Difficulty must be Easy, Medium, Hard, or All.'),
  // domain: filter by problem type (dsa | sql | all). Omitting returns all.
  query('domain')
    .optional({ checkFalsy: true })
    .isIn(['dsa', 'sql', 'all'])
    .withMessage('Domain must be dsa, sql, or all.'),
  query('topic')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Topic cannot exceed 100 characters.'),
  query('company')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company cannot exceed 100 characters.'),
  query('search')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Search query cannot exceed 200 characters.'),
  query('sortBy')
    .optional({ checkFalsy: true })
    .isIn(['leetcodeId', 'title', 'difficulty', 'frequency', 'acceptanceRate', 'createdAt', 'frequency_desc', 'frequency_asc'])
    .withMessage('Invalid sortBy field.'),
  query('sortOrder')
    .optional({ checkFalsy: true })
    .isIn(['asc', 'desc', '1', '-1'])
    .withMessage('sortOrder must be asc, desc, 1, or -1.'),
];

export const blogQueryRules = [
  query('page')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer.')
    .toInt(),
  query('limit')
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100.')
    .toInt(),
  query('difficulty')
    .optional({ checkFalsy: true })
    .isIn(['Easy', 'Medium', 'Hard', 'All'])
    .withMessage('Difficulty must be Easy, Medium, Hard, or All.'),
  query('blogType')
    .optional({ checkFalsy: true })
    .isIn(['GENERAL_ARTICLE', 'CODING_SOLUTION', 'ALL'])
    .withMessage('blogType must be GENERAL_ARTICLE, CODING_SOLUTION, or ALL.'),
  query('topic')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Topic cannot exceed 100 characters.'),
  query('tag')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Tag cannot exceed 50 characters.'),
  query('problemId')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('problemId must be a valid MongoDB ObjectId.'),
  query('search')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Search query cannot exceed 200 characters.'),
];

// ── Code Execution & Submission Validators ─────────────────────────────

export const codeExecutionRules = [
  body('language')
    .trim()
    .notEmpty()
    .withMessage('Language is required.')
    .isIn(['cpp', 'c++', 'java', 'python', 'python3', 'javascript', 'typescript', 'go', 'rust', 'csharp', 'sql'])
    .withMessage('Unsupported programming language.'),
  body('code')
    .isString()
    .withMessage('Code must be a string.')
    .trim()
    .notEmpty()
    .withMessage('Code cannot be empty.')
    .isLength({ max: 50000 })
    .withMessage('Code cannot exceed 50,000 characters (50KB).'),
  body('testCases')
    .optional()
    .isArray({ max: 50 })
    .withMessage('testCases must be an array of at most 50 items.'),
];

// ── Blog, Comment & Report Validators ──────────────────────────────────

export const commentRules = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required.')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters.'),
];

export const reportRules = [
  body('reason')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Report reason cannot exceed 500 characters.'),
];

export const blogValidationRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required.')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters.'),
  body('slug')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Slug must be between 2 and 200 characters.')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase alphanumeric characters and hyphens.'),
  body('problem')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('Problem must be a valid MongoDB ObjectId.'),
  body('excerpt')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Excerpt cannot exceed 1000 characters.'),
  body('content')
    .optional()
    .isObject()
    .withMessage('Content must be an object containing sections.'),
  body('blogType')
    .optional({ checkFalsy: true })
    .isIn(['GENERAL_ARTICLE', 'CODING_SOLUTION'])
    .withMessage('blogType must be GENERAL_ARTICLE or CODING_SOLUTION.'),
  body('platform')
    .optional({ checkFalsy: true })
    .isIn(['LeetCode', 'GeeksforGeeks', 'Codeforces', 'HackerRank', 'CodeChef', 'Other'])
    .withMessage('Invalid platform.'),
  body('difficulty')
    .optional({ checkFalsy: true })
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be Easy, Medium, or Hard.'),
  body('problemUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Problem URL must be a valid URL.')
    .isLength({ max: 500 })
    .withMessage('Problem URL cannot exceed 500 characters.'),
  body('intuition')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Intuition must be a string.')
    .isLength({ max: 50000 })
    .withMessage('Intuition cannot exceed 50,000 characters.'),
  body('approach')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Approach must be a string.')
    .isLength({ max: 50000 })
    .withMessage('Approach cannot exceed 50,000 characters.'),
  body('timeComplexity')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Time complexity cannot exceed 100 characters.'),
  body('spaceComplexity')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Space complexity cannot exceed 100 characters.'),
  body('code')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Code must be a string.')
    .isLength({ max: 100000 })
    .withMessage('Code cannot exceed 100,000 characters.'),
  body('codeLanguage')
    .optional({ checkFalsy: true })
    .trim()
    .isIn(['cpp', 'c++', 'java', 'python', 'python3', 'javascript', 'typescript', 'go', 'rust', 'csharp', 'sql', 'text'])
    .withMessage('Invalid code language.'),
  body('tags')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Tags must be an array of at most 20 strings.'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters.'),
  body('readingTime')
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 120 })
    .withMessage('Reading time must be between 1 and 120 minutes.')
    .toInt(),
];
