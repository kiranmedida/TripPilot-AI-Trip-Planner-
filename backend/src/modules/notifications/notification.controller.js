import * as notificationService from './notification.service.js';
import { successResponse } from '../../utils/response.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user.id);
    return successResponse(res, 'Notifications fetched successfully.', { notifications }, 200);
  } catch (error) {
    next(error);
  }
};

export const readNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await notificationService.markAsRead(id, req.user.id);
    return successResponse(res, 'Notification marked as read.', notification, 200);
  } catch (error) {
    next(error);
  }
};

export const readAllNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
    return successResponse(res, 'All notifications marked as read.', result, 200);
  } catch (error) {
    next(error);
  }
};
