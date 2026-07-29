import { User } from '../users/user.model.js';
import { Trip } from '../trips/trip.model.js';
import { AppError } from '../../utils/appError.js';

export const getAllUsers = async () => {
  return await User.find().sort({ createdAt: -1 });
};

export const updateUserRole = async (targetUserId, role) => {
  const user = await User.findById(targetUserId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  user.role = role;
  if (role === 'Premium' || role === 'Admin') {
    user.dailyLimit = 9999;
  } else {
    user.dailyLimit = 5;
  }
  
  await user.save();
  return user;
};

export const resetUserLimit = async (targetUserId) => {
  const user = await User.findById(targetUserId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  user.usedToday = 0;
  user.lastResetDate = new Date();
  await user.save();
  return user;
};

export const deleteUser = async (targetUserId) => {
  const user = await User.findById(targetUserId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  await Trip.deleteMany({ userId: targetUserId });
  await User.findByIdAndDelete(targetUserId);
  
  return { id: targetUserId };
};

export const getAllTrips = async () => {
  return await Trip.find().populate('userId', 'name email').sort({ createdAt: -1 });
};
