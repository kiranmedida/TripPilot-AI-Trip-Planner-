import { Notification } from './notification.model.js';

export const createNotification = async (data) => {
  return await Notification.create({
    recipientId: data.recipientId,
    senderId: data.senderId || null,
    type: data.type,
    title: data.title,
    message: data.message,
    link: data.link || '',
  });
};

export const getUserNotifications = async (userId) => {
  return await Notification.find({ recipientId: userId })
    .populate('senderId', 'name profilePic')
    .sort({ createdAt: -1 });
};

export const markAsRead = async (notificationId, userId) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, recipientId: userId },
    { isRead: true },
    { new: true }
  );
};

export const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { recipientId: userId, isRead: false },
    { isRead: true }
  );
  return { success: true };
};
