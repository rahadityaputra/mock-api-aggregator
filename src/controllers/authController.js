/**
 * authController.js
 * HTTP handlers for authentication endpoints.
 * Delegates all business logic to authService.
 */

import * as authService from '../services/authService.js';
import { sendSuccess, sendCreated, sendError } from '../utils/responses.js';

/**
 * POST /api/auth/register
 * Register a new user account.
 *
 * Body: { email, username, password, name? }
 */
export const register = async (req, res, next) => {
  try {
    const { email, username, password, name } = req.body;

    // Basic field presence validation
    if (!email || !username || !password) {
      return sendError(res, 'email, username, and password are required', 400);
    }

    const { user, token } = await authService.registerUser({ email, username, password, name });

    return sendCreated(res, { user, token }, 'Account registered successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Authenticate with email + password.
 *
 * Body: { email, password }
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'email and password are required', 400);
    }

    const { user, token } = await authService.loginUser(email, password);

    return sendSuccess(res, { user, token }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Get the currently authenticated user's profile.
 * Requires: authenticate middleware
 */
export const getMe = async (req, res, next) => {
  try {
    const user = authService.getCurrentUser(req.user.id);
    return sendSuccess(res, { user }, 'Profile retrieved');
  } catch (err) {
    next(err);
  }
};
