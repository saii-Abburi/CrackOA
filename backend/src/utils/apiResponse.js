/**
 * Standardised API response helpers.
 * All controllers should use these helpers to keep response shapes consistent.
 */

/**
 * Send a successful JSON response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (default 200)
 * @param {string} message - Human-readable success message
 * @param {*} data - Payload to send
 * @param {object} [extra] - Extra top-level fields (e.g. pagination)
 */
export const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, extra = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...extra,
  });
};

/**
 * Send an error JSON response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {string} message - Human-readable error message
 * @param {string} [code] - Application-level error code
 * @param {*} [details] - Additional error details (dev only)
 */
export const sendError = (res, statusCode = 500, message = 'Something went wrong', code = 'INTERNAL_ERROR', details = null) => {
  const response = {
    success: false,
    message,
    error: { code },
  };

  // Only attach debug details in development
  if (process.env.NODE_ENV === 'development' && details) {
    response.error.details = details;
  }

  return res.status(statusCode).json(response);
};

/**
 * Build a pagination metadata object.
 * @param {number} page
 * @param {number} limit
 * @param {number} total
 */
export const buildPagination = (page, limit, total) => ({
  page: Number(page),
  limit: Number(limit),
  total,
  totalPages: Math.ceil(total / limit),
});
