/**
 * authentication.js
 * Express middleware for JWT-based route protection.
 * Validates Bearer token from Authorization header and attaches
 * the decoded user payload to req.user.
 */

import { verifyToken } from '../utils/jwt.js';
import { users } from '../models/User.js';
import { sendUnauthorized } from '../utils/responses.js';

/**
 * authenticate middleware
 * Validates JWT and hydrates req.user with the current user record.
 * Attach to any route that requires a logged-in user.
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Expect: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendUnauthorized(res, 'No token provided. Include Authorization: Bearer <token>');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);

    // Confirm user still exists in the store
    const user = users.find((u) => u.id === decoded.id);
    if (!user) {
      return sendUnauthorized(res, 'User account no longer exists');
    }

    // Attach sanitized user info (without password) to the request
    const { password, ...safeUser } = user;
    req.user = safeUser;

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendUnauthorized(res, 'Token has expired. Please log in again.');
    }
    if (err.name === 'JsonWebTokenError') {
      return sendUnauthorized(res, 'Invalid token. Please log in again.');
    }
    return sendUnauthorized(res, 'Authentication failed');
  }
};

/**
 * optionalAuthenticate middleware
 * Same as authenticate but does NOT block the request if no token is provided.
 * Useful for endpoints that behave differently for logged-in vs anonymous users.
 */
export const optionalAuthenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    const user = users.find((u) => u.id === decoded.id);
    if (user) {
      const { password, ...safeUser } = user;
      req.user = safeUser;
    } else {
      req.user = null;
    }
  } catch {
    req.user = null;
  }

  next();
};
