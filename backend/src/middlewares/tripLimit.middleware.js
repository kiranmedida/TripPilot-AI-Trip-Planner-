import { Trip } from '../modules/trips/trip.model.js';
import { User } from '../modules/users/user.model.js';
import { AppError } from '../utils/appError.js';

export const checkTripLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.role === 'Premium' || user.role === 'Admin') {
      return next();
    }

    const savedTripsCount = await Trip.countDocuments({ userId: user._id });
    if (savedTripsCount >= 10) {
      return next(new AppError('You have reached the limit of 10 saved trips. Upgrade to Premium for unlimited storage.', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};
