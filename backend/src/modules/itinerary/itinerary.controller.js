import * as itineraryService from './itinerary.service.js';
import { successResponse } from '../../utils/response.js';

export const toggleCompletion = async (req, res, next) => {
  try {
    const { activityId } = req.params;
    const result = await itineraryService.toggleActivityCompletion(activityId, req.user.id);
    return successResponse(res, 'Activity completion state updated.', result, 200);
  } catch (error) {
    next(error);
  }
};

export const updateActivity = async (req, res, next) => {
  try {
    const { activityId } = req.params;
    const activity = await itineraryService.updateActivityDetail(activityId, req.body);
    return successResponse(res, 'Activity details updated successfully.', activity, 200);
  } catch (error) {
    next(error);
  }
};

export const updateWeather = async (req, res, next) => {
  try {
    const { dayId } = req.params;
    const day = await itineraryService.updateDayWeather(dayId, req.body);
    return successResponse(res, 'Weather information updated.', day, 200);
  } catch (error) {
    next(error);
  }
};
