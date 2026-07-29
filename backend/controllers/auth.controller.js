import * as authService from '../services/auth.service.js';
import { successResponse } from '../utils/response.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.registerUser({ name, email, password });
    return successResponse(res, 'User registered successfully.', result, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    return successResponse(res, 'Login successful.', result, 200);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    return successResponse(res, 'Logout successful.', null, 200);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const userProfile = await authService.getUserProfile(req.user.id);
    return successResponse(res, 'User profile fetched successfully.', { user: userProfile }, 200);
  } catch (error) {
    next(error);
  }
};
