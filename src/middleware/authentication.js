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

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendUnauthorized(res, 'Tidak ada token terdeteksi.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);

    const user = users.find((u) => u.id === decoded.id);
    if (!user) {
      return sendUnauthorized(res, 'Akun user sudah tidak ada');
    }

    const { password, ...safeUser } = user;
    req.user = safeUser;

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendUnauthorized(res, 'Token sudah kadaluarsa. Silakan login kembali.');
    }
    if (err.name === 'JsonWebTokenError') {
      return sendUnauthorized(res, 'Token tidak valid. Silakan login kembali.');
    }
    return sendUnauthorized(res, 'Autentikasi Gagal');
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
