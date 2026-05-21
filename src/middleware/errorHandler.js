/**
 * Global error handler.
 * Catches errors thrown by any route or middleware via next(err).
 */
export const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}`, {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  const status = err.status || err.statusCode || 500;

  const response = {
    success: false,
    message: err.message || 'Terjadi kesalahan di server',
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }

  if (err.errors) {
    response.errors = err.errors;
  }

  res.status(status).json(response);
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} tidak ditemukan`,
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
