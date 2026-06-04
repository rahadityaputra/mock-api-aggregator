import jwt from 'jsonwebtoken';

const getSecret = () => process.env.JWT_SECRET || 'dev-secret-change-me';

export const signToken = (payload) =>
  jwt.sign(payload, getSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

export const verifyToken = (token) => jwt.verify(token, getSecret());