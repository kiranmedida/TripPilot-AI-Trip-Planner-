import { Activity } from './activity.model.js';
import { TripDay } from './tripDay.model.js';
import { User } from '../users/user.model.js';
import { AppError } from '../../utils/appError.js';

export const toggleActivityCompletion = async (activityId, userId) => {
  const activity = await Activity.findById(activityId);
  if (!activity) {
    throw new AppError('Activity not found.', 404);
  }

  // Toggle completion
  activity.completed = !activity.completed;
  await activity.save();

  // Award XP
  const xpReward = 15;
  const user = await User.findById(userId);
  let leveledUp = false;

  if (user) {
    const oldLevel = user.level;
    if (activity.completed) {
      user.xp += xpReward;
    } else {
      user.xp = Math.max(0, user.xp - xpReward);
    }

    // Level calculation formula: 100 XP per level
    const newLevel = Math.floor(user.xp / 100) + 1;
    if (newLevel > oldLevel) {
      user.level = newLevel;
      leveledUp = true;
    } else if (newLevel < oldLevel) {
      user.level = newLevel;
    }
    
    await user.save();
  }

  return {
    activity,
    xp: user ? user.xp : 0,
    level: user ? user.level : 1,
    leveledUp,
  };
};

export const updateActivityDetail = async (activityId, updateData) => {
  const activity = await Activity.findById(activityId);
  if (!activity) {
    throw new AppError('Activity not found.', 404);
  }

  activity.activity = updateData.activity !== undefined ? updateData.activity : activity.activity;
  activity.foodRecommendation = updateData.foodRecommendation !== undefined ? updateData.foodRecommendation : activity.foodRecommendation;
  activity.transportation = updateData.transportation !== undefined ? updateData.transportation : activity.transportation;
  activity.budgetEstimate = updateData.budgetEstimate !== undefined ? updateData.budgetEstimate : activity.budgetEstimate;
  activity.rating = updateData.rating !== undefined ? updateData.rating : activity.rating;
  activity.review = updateData.review !== undefined ? updateData.review : activity.review;

  await activity.save();
  return activity;
};

export const updateDayWeather = async (dayId, weatherSummary) => {
  const day = await TripDay.findById(dayId);
  if (!day) {
    throw new AppError('Trip day not found.', 404);
  }

  day.weatherSummary = {
    ...day.weatherSummary,
    ...weatherSummary,
  };

  await day.save();
  return day;
};
