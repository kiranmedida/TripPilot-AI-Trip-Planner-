import { User } from '../models/user.model.js';
import { AppError } from '../utils/appError.js';
import { signToken } from '../utils/jwt.js';

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email is already registered.', 400);
  }

  const user = await User.create({ name, email, password });
  
  const userResponse = user.toObject();
  delete userResponse.password;

  const token = signToken({ id: user._id, email: user.email, role: user.role });

  return { user: userResponse, token };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  const userResponse = user.toObject();
  delete userResponse.password;

  const token = signToken({ id: user._id, email: user.email, role: user.role });

  return { user: userResponse, token };
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User profile not found.', 404);
  }
  return user;
};
