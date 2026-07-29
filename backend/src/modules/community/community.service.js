import { Template } from './template.model.js';
import { Like } from './like.model.js';
import { Comment } from './comment.model.js';
import { Trip } from '../trips/trip.model.js';
import { TripDay } from '../itinerary/tripDay.model.js';
import { Activity } from '../itinerary/activity.model.js';
import { AppError } from '../../utils/appError.js';

export const shareTrip = async (tripId, title, description, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new AppError('Trip not found.', 404);
  }

  if (trip.userId.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to share this trip.', 403);
  }

  trip.isPublic = true;
  await trip.save();

  // Create public template if it doesn't already exist
  let template = await Template.findOne({ originalTripId: tripId });
  if (!template) {
    template = await Template.create({
      originalTripId: tripId,
      creatorId: userId,
      title: title || trip.title,
      description: description || trip.description || 'Check out my awesome itinerary!',
      destination: trip.destination,
      durationDays: trip.days,
      travelStyle: trip.travelStyle,
    });
  }

  return template;
};

export const duplicateTemplate = async (templateId, userId) => {
  const template = await Template.findById(templateId);
  if (!template) {
    throw new AppError('Template not found.', 404);
  }

  const originalTrip = await Trip.findById(template.originalTripId);
  if (!originalTrip) {
    throw new AppError('Original trip data is unavailable for cloning.', 404);
  }

  // Clone trip header
  const clonedTrip = await Trip.create({
    title: `${template.title} (Clone)`,
    destination: template.destination,
    budget: originalTrip.budget,
    days: template.durationDays,
    travelStyle: template.travelStyle,
    tripTemplate: originalTrip.tripTemplate,
    userId,
    isPublic: false,
    packingList: originalTrip.packingList.map(p => ({ item: p.item, packed: false })),
    travelTips: originalTrip.travelTips,
  });

  // Fetch and clone days/activities
  const originalDays = await TripDay.find({ tripId: originalTrip._id }).sort({ dayNumber: 1 });
  for (const day of originalDays) {
    const clonedDay = await TripDay.create({
      tripId: clonedTrip._id,
      dayNumber: day.dayNumber,
      date: null,
      weatherSummary: day.weatherSummary,
    });

    const originalActivities = await Activity.find({ tripId: originalTrip._id, dayId: day._id });
    for (const act of originalActivities) {
      await Activity.create({
        tripId: clonedTrip._id,
        dayId: clonedDay._id,
        timeOfDay: act.timeOfDay,
        activity: act.activity,
        foodRecommendation: act.foodRecommendation,
        transportation: act.transportation,
        budgetEstimate: act.budgetEstimate,
        completed: false,
      });
    }
  }

  // Increment clones count
  template.clonesCount += 1;
  await template.save();

  return clonedTrip;
};

export const toggleLikeTemplate = async (templateId, userId) => {
  const template = await Template.findById(templateId);
  if (!template) {
    throw new AppError('Template not found.', 404);
  }

  const existingLike = await Like.findOne({ userId, targetId: templateId, targetType: 'Template' });
  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    template.likesCount = Math.max(0, template.likesCount - 1);
    await template.save();
    return { liked: false, likesCount: template.likesCount };
  } else {
    await Like.create({ userId, targetId: templateId, targetType: 'Template' });
    template.likesCount += 1;
    await template.save();
    return { liked: true, likesCount: template.likesCount };
  }
};

export const addComment = async (templateId, text, userId) => {
  const template = await Template.findById(templateId);
  if (!template) {
    throw new AppError('Template not found.', 404);
  }

  const comment = await Comment.create({
    targetId: templateId,
    targetType: 'Template',
    userId,
    text,
  });

  template.commentsCount += 1;
  await template.save();

  return await comment.populate('userId', 'name profilePic');
};

export const getTemplateComments = async (templateId) => {
  return await Comment.find({ targetId: templateId, targetType: 'Template' })
    .populate('userId', 'name profilePic')
    .sort({ createdAt: 1 });
};

export const getFeed = async (query = {}) => {
  const limit = parseInt(query.limit) || 10;
  const page = parseInt(query.page) || 1;
  const skip = (page - 1) * limit;

  const searchFilter = {};
  if (query.destination) {
    searchFilter.destination = new RegExp(query.destination, 'i');
  }

  const templates = await Template.find(searchFilter)
    .populate('creatorId', 'name profilePic level')
    .sort({ likesCount: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return templates;
};
