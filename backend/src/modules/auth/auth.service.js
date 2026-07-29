import { User } from '../users/user.model.js';
import { AppError } from '../../utils/appError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email is already registered.', 400);
  }

  const user = await User.create({ name, email, password });
  
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshTokens;

  const accessToken = signAccessToken({ id: user._id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ id: user._id });

  // Persist refresh token with expiry (7 days)
  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
  await user.save();

  return { user: userResponse, token: accessToken, refreshToken };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshTokens;

  const accessToken = signAccessToken({ id: user._id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ id: user._id });

  // Prune expired tokens and save the new one
  user.refreshTokens = user.refreshTokens.filter(t => t.expiresAt > new Date());
  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
  await user.save();

  return { user: userResponse, token: accessToken, refreshToken };
};

export const refreshSession = async (token) => {
  if (!token) {
    throw new AppError('Refresh token is required.', 401);
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    throw new AppError('Invalid or expired refresh token.', 401);
  }

  // Find user and match exact token
  const user = await User.findOne({ _id: decoded.id, 'refreshTokens.token': token });
  if (!user) {
    throw new AppError('Refresh token not found or session expired.', 401);
  }

  // Remove the old refresh token (rotation!)
  user.refreshTokens = user.refreshTokens.filter(t => t.token !== token && t.expiresAt > new Date());

  const newAccessToken = signAccessToken({ id: user._id, email: user.email, role: user.role });
  const newRefreshToken = signRefreshToken({ id: user._id });

  user.refreshTokens.push({
    token: newRefreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
  await user.save();

  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshTokens;

  return { user: userResponse, token: newAccessToken, refreshToken: newRefreshToken };
};

export const logoutUser = async (userId, token) => {
  if (token) {
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: { token } }
    });
  }
};
