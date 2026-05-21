/**
 * auth.js
 * Routes for authentication endpoints.
 */

import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/authentication.js';

const router = Router();

// POST /api/auth/register  — Create new account
router.post('/register', register);

// POST /api/auth/login     — Authenticate and receive JWT
router.post('/login', login);

// GET  /api/auth/me        — Get current user profile (protected)
router.get('/me', authenticate, getMe);

export default router;
