import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export const users = [];
const seedPassword = bcrypt.hashSync('password123', 10);

users.push({
  id: uuidv4(),
  email: 'test@example.com',
  username: 'testuser',
  password: seedPassword,
  name: 'Test User',
  role: 'seller',
  createdAt: new Date().toISOString(),
});

/**
 * Creates a new User object with a hashed password.
 * @param {object} data - { email, username, password, name }
 * @returns {object} User record ready for storage
 */
export const createUser = async ({ email, username, password, name }) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  return {
    id: uuidv4(),
    email: email.toLowerCase().trim(),
    username: username.toLowerCase().trim(),
    password: hashedPassword,
    name: name || username,
    role: 'seller',
    createdAt: new Date().toISOString(),
  };
};

/**
 * Returns a safe user object (without password).
 * @param {object} user
 * @returns {object}
 */
export const sanitizeUser = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};
