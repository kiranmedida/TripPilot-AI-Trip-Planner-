import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/appError.js';
import { User } from '../modules/users/user.model.js';

export const auth = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Authentication credentials not provided.', 401));
    }

    const decoded = verifyToken(token);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('User belonging to this token no longer exists.', 401));
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
    };
    req.currentUser = user;
    next();
  } catch (error) {
    next(new AppError('Authentication failed: Invalid or expired access token.', 401));
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};

export const requirePremium = (req, res, next) => {
  if (req.user.role !== 'Premium' && req.user.role !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Premium membership required.'
    });
  }
  next();
};
