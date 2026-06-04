import { getAuthenticatedUser, loginUser, registerUser } from '../services/authService.js';

export const register = async (req, res, next) => {
  try {
    const result = await registerUser(req.validatedBody);

    return res.status(201).json({
      success: true,
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.validatedBody);

    return res.status(200).json({
      success: true,
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req.user.id);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};