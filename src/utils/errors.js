export class AppError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const badRequest = (message, details = null) => new AppError(400, message, details);
export const unauthorized = (message = 'Unauthorized') => new AppError(401, message);
export const forbidden = (message = 'Forbidden') => new AppError(403, message);
export const notFound = (message = 'Resource not found') => new AppError(404, message);
export const conflict = (message, details = null) => new AppError(409, message, details);
export const unprocessable = (message, details = null) => new AppError(422, message, details);
export const serviceUnavailable = (message) => new AppError(503, message);
export const gatewayTimeout = (message) => new AppError(504, message);