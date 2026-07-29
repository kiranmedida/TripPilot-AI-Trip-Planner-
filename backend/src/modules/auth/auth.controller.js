import * as authService from './auth.service.js';
import { successResponse } from '../../utils/response.js';
import { AppError } from '../../utils/appError.js';
import { User } from '../users/user.model.js';

const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax', // Lax is preferred for cross-site local developments
  });
};

const getRefreshTokenFromReq = (req) => {
  if (req.cookies && req.cookies.refreshToken) {
    return req.cookies.refreshToken;
  }
  if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, c) => {
      const parts = c.trim().split('=');
      if (parts[0]) acc[parts[0].trim()] = parts[1] ? parts[1].trim() : '';
      return acc;
    }, {});
    return cookies.refreshToken;
  }
  return null;
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.registerUser({ name, email, password });
    setRefreshTokenCookie(res, result.refreshToken);
    return successResponse(res, 'User registered successfully.', { user: result.user, token: result.token }, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    setRefreshTokenCookie(res, result.refreshToken);
    return successResponse(res, 'Login successful.', { user: result.user, token: result.token }, 200);
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = getRefreshTokenFromReq(req);
    if (!token) {
      return next(new AppError('No refresh token provided.', 401));
    }
    const result = await authService.refreshSession(token);
    setRefreshTokenCookie(res, result.refreshToken);
    return successResponse(res, 'Session refreshed successfully.', { user: result.user, token: result.token }, 200);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = getRefreshTokenFromReq(req);
    if (req.user && req.user.id) {
      await authService.logoutUser(req.user.id, token);
    }
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return successResponse(res, 'Logout successful.', null, 200);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User profile not found.', 404));
    }
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshTokens;
    return successResponse(res, 'User profile fetched successfully.', { user: userResponse }, 200);
  } catch (error) {
    next(error);
  }
};
