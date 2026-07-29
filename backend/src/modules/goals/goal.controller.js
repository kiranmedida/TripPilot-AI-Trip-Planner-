import * as goalService from './goal.service.js';
import { successResponse } from '../../utils/response.js';

export const getGoals = async (req, res, next) => {
  try {
    const goals = await goalService.getUserGoals(req.user.id);
    return successResponse(res, 'Goals fetched successfully.', { goals }, 200);
  } catch (error) {
    next(error);
  }
};

export const getAchievements = async (req, res, next) => {
  try {
    const achievements = await goalService.getUserAchievements(req.user.id);
    return successResponse(res, 'Achievements fetched successfully.', { achievements }, 200);
  } catch (error) {
    next(error);
  }
};

export const checkProgress = async (req, res, next) => {
  try {
    const result = await goalService.evaluateGoalsAndAchievements(req.user.id);
    return successResponse(res, 'Gamification progress evaluated.', result, 200);
  } catch (error) {
    next(error);
  }
};
