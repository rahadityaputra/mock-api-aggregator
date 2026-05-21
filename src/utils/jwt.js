/**
 * jwt.js
 * Utility functions for generating and verifying JWT tokens.
 */

import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'fallback_dev_secret_not_for_production';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a signed JWT for a user payload.
 * @param {object} payload - Data to encode (e.g. { id, email, role })
 * @returns {string} Signed JWT string
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
};

/**
 * Verify and decode a JWT string.
 * @param {string} token
 * @returns {object} Decoded payload
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
export const verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};

/**
 * Decode a token without verifying its signature.
 * Useful for debugging — do NOT use for authentication.
 * @param {string} token
 * @returns {object|null}
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};
