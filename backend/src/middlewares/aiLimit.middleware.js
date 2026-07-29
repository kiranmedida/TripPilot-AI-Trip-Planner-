import { User } from '../modules/users/user.model.js';
import { AppError } from '../utils/appError.js';

export const checkAiLimits = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const today = new Date();
    const lastReset = new Date(user.lastResetDate);

    // Compare date parts (YYYY-MM-DD)
    const isNewDay =
      today.getUTCFullYear() !== lastReset.getUTCFullYear() ||
      today.getUTCMonth() !== lastReset.getUTCMonth() ||
      today.getUTCDate() !== lastReset.getUTCDate();

    if (isNewDay) {
      user.usedToday = 0;
      user.lastResetDate = today;
      await user.save();
    }

    // Bypass check for Premium and Admin roles
    if (user.role === 'Premium' || user.role === 'Admin') {
      req.currentUser = user;
      return next();
    }

    // Check if limit reached
    if (user.usedToday >= user.dailyLimit) {
      return next(new AppError('Daily AI request limit reached. Upgrade to Premium for unlimited access.', 429));
    }

    req.currentUser = user;
    next();
  } catch (error) {
    next(error);
  }
};
