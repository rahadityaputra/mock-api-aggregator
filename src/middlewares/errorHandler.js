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

export const notFoundHandler = (req, res) => {
    logApiEvent("warn", "[API_404]", {
        method: req.method,
        path: req.originalUrl,
        params: req.params,
        query: req.query,
        body: serializeRequestBody(req.body),
        timestamp: new Date().toISOString(),
    });

    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
};

export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || err.status || 500;

    logApiEvent(statusCode >= 500 ? "error" : "warn", "[API_ERROR]", {
        method: req.method,
        path: req.originalUrl,
        statusCode,
        errorName: err.name || "Error",
        message: err.message || "Internal server error",
        params: req.params,
        query: req.query,
        body: serializeRequestBody(req.body),
        details: err.details || undefined,
        stack: isDevelopment && err.stack ? err.stack : undefined,
        timestamp: new Date().toISOString(),
    });

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal server error",
        details: err.details || undefined,
        ...(isDevelopment && err.stack ? { stack: err.stack } : {}),
    });
};
