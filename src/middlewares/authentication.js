import { prisma } from '../prisma/client.js';
import { verifyToken } from '../utils/jwt.js';
import { unauthorized } from '../utils/errors.js';

export const authenticate = async (req, res, next) => {
  const header = req.headers.authorization || '';

  if (!header.startsWith('Bearer ')) {
    return next(unauthorized('Missing bearer token'));
  }

  try {
    const token = header.split(' ')[1];
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return next(unauthorized('User not found'));
    }

    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.name === 'TokenExpiredError') {
      return next(unauthorized('Token expired'));
    }

    return next(unauthorized('Invalid token'));
  }
};