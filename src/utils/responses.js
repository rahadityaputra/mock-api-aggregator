/**
 * Send a successful response.
 *
 * @param {object} res         - Express response object
 * @param {*}      data        - Response payload
 * @param {string} [message]   - Optional human-readable message
 * @param {number} [status=200] - HTTP status code
 */
export const sendSuccess = (res, data, message = 'Success', status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Send a created (201) response.
 *
 * @param {object} res       - Express response object
 * @param {*}      data      - Created resource payload
 * @param {string} [message] - Optional human-readable message
 */
export const sendCreated = (res, data, message = 'Resource created successfully') => {
  return sendSuccess(res, data, message, 201);
};

/**
 * Send an error response.
 *
 * @param {object} res          - Express response object
 * @param {string} message      - Error description
 * @param {number} [status=500] - HTTP status code
 * @param {*}      [errors]     - Optional validation errors or extra context
 */
export const sendError = (res, message, status = 500, errors = null) => {
  const payload = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors) {
    payload.errors = errors;
  }

  return res.status(status).json(payload);
};

/**
 * Send a 404 Not Found response.
 *
 * @param {object} res      - Express response object
 * @param {string} resource - Name of the missing resource (e.g. "Product")
 */
export const sendNotFound = (res, resource = 'Resource') => {
  return sendError(res, `${resource} not found`, 404);
};

/**
 * Send a 401 Unauthorized response.
 *
 * @param {object} res      - Express response object
 * @param {string} [message]
 */
export const sendUnauthorized = (res, message = 'Authentication required') => {
  return sendError(res, message, 401);
};

/**
 * Send a 403 Forbidden response.
 *
 * @param {object} res      - Express response object
 * @param {string} [message]
 */
export const sendForbidden = (res, message = 'Access denied') => {
  return sendError(res, message, 403);
};

/**
 * Send a paginated list response.
 *
 * @param {object} res        - Express response object
 * @param {Array}  items      - Array of items for this page
 * @param {number} total      - Total items across all pages
 * @param {number} page       - Current page number (1-indexed)
 * @param {number} limit      - Items per page
 * @param {string} [message]
 */
export const sendPaginated = (res, items, total, page, limit, message = 'Success') => {
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    message,
    data: items,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    timestamp: new Date().toISOString(),
  });
};
