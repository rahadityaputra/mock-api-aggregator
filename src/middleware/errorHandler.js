const isDevelopment = process.env.NODE_ENV === "development";

const serializeRequestBody = (body) => {
    if (!body || typeof body !== "object") {
        return undefined;
    }

    return body;
};

const logApiEvent = (level, label, payload) => {
    const logger = level === "warn" ? console.warn : console.error;
    logger(label, payload);
};

/**
 * Global error handler.
 * Catches errors thrown by any route or middleware via next(err).
 */
export const errorHandler = (err, req, res, next) => {
    const status = err.status || err.statusCode || 500;

    logApiEvent(status >= 500 ? "error" : "warn", "[ERROR]", {
        method: req.method,
        path: req.originalUrl || req.path,
        statusCode: status,
        message: err.message,
        stack: isDevelopment ? err.stack : undefined,
        details: err.details || err.errors || undefined,
        params: req.params,
        query: req.query,
        body: serializeRequestBody(req.body),
        timestamp: new Date().toISOString(),
    });

    const response = {
        success: false,
        message: err.message || "Terjadi kesalahan di server",
        timestamp: new Date().toISOString(),
    };

    if (isDevelopment && err.stack) {
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
            "GET  /health",
            "POST /api/auth/register",
            "POST /api/auth/login",
            "GET  /api/auth/me",
            "GET  /api/:marketplace/products",
            "GET  /api/:marketplace/products/:id",
            "POST /api/:marketplace/orders",
            "GET  /api/:marketplace/orders",
            "GET  /api/:marketplace/orders/:id",
            "PUT  /api/:marketplace/stock/:sku",
            "PUT  /api/:marketplace/stock/bulk",
            "POST /api/:marketplace/webhook/config",
            "POST /api/:marketplace/webhook/test",
            "POST /api/:marketplace/reset",
            "POST /api/:marketplace/simulate-error",
            "GET  /api/:marketplace/status",
        ],
        timestamp: new Date().toISOString(),
    });
};
