/**
 * errorHandler.js
 * Global Express error-handling middleware.
 * Must be registered LAST in the middleware chain (after all routes).
 */

/**
 * Global error handler.
 * Catches errors thrown by any route or middleware via next(err).
 */
export const errorHandler = (err, req, res, next) => {
  // Log the full error for server-side visibility
  console.error(`[ERROR] ${req.method} ${req.path}`, {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Determine status code
  const status = err.status || err.statusCode || 500;

  // Build the response
  const response = {
    success: false,
    message: err.message || 'An unexpected server error occurred',
    timestamp: new Date().toISOString(),
  };

  // Include stack trace only in development mode
  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }

  // Include validation errors if present
  if (err.errors) {
    response.errors = err.errors;
  }

  res.status(status).json(response);
};

/**
 * 404 Not Found handler.
 * Register BEFORE the global error handler, AFTER all valid routes.
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: [
      'GET  /health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET  /api/auth/me',
      'GET  /api/:marketplace/products',
      'GET  /api/:marketplace/products/:id',
      'POST /api/:marketplace/orders',
      'GET  /api/:marketplace/orders',
      'GET  /api/:marketplace/orders/:id',
      'PUT  /api/:marketplace/stock/:sku',
      'PUT  /api/:marketplace/stock/bulk',
      'POST /api/:marketplace/webhook/config',
      'POST /api/:marketplace/webhook/test',
      'POST /api/:marketplace/reset',
      'POST /api/:marketplace/simulate-error',
      'GET  /api/:marketplace/status',
    ],
    timestamp: new Date().toISOString(),
  });
};
