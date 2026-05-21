/**
 * authService.js
 * Business logic for user registration, login, and profile retrieval.
 */

import bcrypt from 'bcryptjs';
import { users, createUser, sanitizeUser } from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

/**
 * Register a new user account.
 *
 * @param {object} data - { email, username, password, name }
 * @returns {{ user: object, token: string }}
 * @throws {Error} If email or username already taken
 */
export const registerUser = async ({ email, username, password, name }) => {
  // Check for existing email
  if (users.find((u) => u.email === email.toLowerCase().trim())) {
    const err = new Error('Email address is already registered');
    err.status = 409;
    throw err;
  }

  // Check for existing username
  if (users.find((u) => u.username === username.toLowerCase().trim())) {
    const err = new Error('Username is already taken');
    err.status = 409;
    throw err;
  }

  // Validate password strength
  if (password.length < 6) {
    const err = new Error('Password must be at least 6 characters long');
    err.status = 400;
    throw err;
  }

  const newUser = await createUser({ email, username, password, name });
  users.push(newUser);

  const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role });

  return { user: sanitizeUser(newUser), token };
};

/**
 * Authenticate a user with email + password credentials.
 *
 * @param {string} email
 * @param {string} password
 * @returns {{ user: object, token: string }}
 * @throws {Error} If credentials are invalid
 */
export const loginUser = async (email, password) => {
  const user = users.find((u) => u.email === email.toLowerCase().trim());

  if (!user) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  return { user: sanitizeUser(user), token };
};

/**
 * Get the current authenticated user's profile.
 *
 * @param {string} userId
 * @returns {object} Sanitized user record
 * @throws {Error} If user not found
 */
export const getCurrentUser = (userId) => {
  const user = users.find((u) => u.id === userId);

  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  return sanitizeUser(user);
};
