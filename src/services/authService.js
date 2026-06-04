import bcrypt from 'bcrypt';

import { conflict, unauthorized } from '../utils/errors.js';
import { signToken } from '../utils/jwt.js';
import { createUser, findUserByEmail, findUserById } from '../repositories/userRepository.js';

const safeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

export const registerUser = async ({ name, email, password }) => {
  const existing = await findUserByEmail(email);

  if (existing) {
    throw conflict('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await createUser({ name, email, password: hashedPassword });
  const token = signToken({ id: user.id, email: user.email });

  return {
    user: safeUser(user),
    token,
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw unauthorized('Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    throw unauthorized('Invalid email or password');
  }

  return {
    user: safeUser(user),
    token: signToken({ id: user.id, email: user.email }),
  };
};

export const getAuthenticatedUser = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    throw unauthorized('User not found');
  }

  return safeUser(user);
};