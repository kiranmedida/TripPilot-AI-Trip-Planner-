import { Trip } from './trip.model.js';
import { TripDay } from '../itinerary/tripDay.model.js';
import { Activity } from '../itinerary/activity.model.js';
import { AppError } from '../../utils/appError.js';

export const createTrip = async (tripData, userId) => {
  const formattedPacking = (tripData.packingList || []).map((item) =>
    typeof item === 'string' ? { item, packed: false, isCustom: true } : item
  );

  const budgetNum = typeof tripData.budget === 'number' 
    ? tripData.budget 
    : parseFloat(String(tripData.budget || '').replace(/[^0-9.]/g, '')) || 0;

  const trip = await Trip.create({
    title: tripData.title,
    destination: tripData.destination,
    budget: budgetNum,
    days: tripData.days || (tripData.itinerary || []).length || 1,
    travelStyle: tripData.travelStyle || 'Casual',
    tripTemplate: tripData.tripTemplate || 'Custom Trip',
    userId,
    collaborators: tripData.collaborators || [],
    coverImage: tripData.coverImage || '',
    packingList: formattedPacking,
    travelTips: tripData.travelTips || [],
    status: tripData.status || 'upcoming',
  });

  // Save Day & Activity documents
  const itinerary = tripData.itinerary || [];
  for (const dayObj of itinerary) {
    const dayNum = dayObj.day || dayObj.dayNumber;
    const tripDay = await TripDay.create({
      tripId: trip._id,
      dayNumber: dayNum,
      date: dayObj.date || null,
      weatherSummary: dayObj.weatherSummary || {},
    });

    const times = ['morning', 'afternoon', 'evening'];
    for (const time of times) {
      const act = dayObj[time];
      if (act) {
        await Activity.create({
          tripId: trip._id,
          dayId: tripDay._id,
          timeOfDay: time.charAt(0).toUpperCase() + time.slice(1),
          activity: act.activity || 'Relax and explore',
          foodRecommendation: act.foodRecommendation || '',
          transportation: act.transportation || '',
          budgetEstimate: parseFloat(String(act.budgetEstimate || '').replace(/[^0-9.]/g, '')) || 0,
          completed: act.completed || false,
        });
      }
    }
  }

  return trip;
};

export const getUserTrips = async (userId) => {
  return await Trip.find({
    $or: [
      { userId },
      { collaborators: userId }
    ]
  }).sort({ createdAt: -1 });
};

export const getTripById = async (tripId, userId, userRole) => {
  const trip = await Trip.findById(tripId)
    .populate('userId', 'name email profilePic')
    .populate('collaborators', 'name email profilePic');
  
  if (!trip) {
    throw new AppError('Trip not found.', 404);
  }

  const isCollaborator = trip.collaborators.some(c => c._id.toString() === userId.toString());
  if (trip.userId._id.toString() !== userId.toString() && !isCollaborator && userRole !== 'Admin') {
    throw new AppError('You do not have permission to view this trip.', 403);
  }

  // Fetch Days and Activities to rebuild the itinerary array
  const days = await TripDay.find({ tripId }).sort({ dayNumber: 1 });
  const activities = await Activity.find({ tripId });

  const itinerary = days.map((day) => {
    const dayActivities = activities.filter(
      (act) => act.dayId.toString() === day._id.toString()
    );

    const findTime = (time) => {
      const found = dayActivities.find((act) => act.timeOfDay === time);
      return found
        ? {
            id: found._id,
            activity: found.activity,
            foodRecommendation: found.foodRecommendation,
            transportation: found.transportation,
            budgetEstimate: found.budgetEstimate,
            completed: found.completed,
            rating: found.rating,
            review: found.review,
          }
        : null;
    };

    return {
      id: day._id,
      day: day.dayNumber,
      date: day.date,
      weatherSummary: day.weatherSummary,
      morning: findTime('Morning'),
      afternoon: findTime('Afternoon'),
      evening: findTime('Evening'),
    };
  });

  const tripObj = trip.toObject();
  tripObj.itinerary = itinerary;

  return tripObj;
};

export const updateTrip = async (tripId, userId, userRole, updateData) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new AppError('Trip not found.', 404);
  }

  const isCollaborator = trip.collaborators.some(id => id.toString() === userId.toString());
  if (trip.userId.toString() !== userId.toString() && !isCollaborator && userRole !== 'Admin') {
    throw new AppError('You do not have permission to update this trip.', 403);
  }

  trip.title = updateData.title || trip.title;
  trip.isPublic = updateData.isPublic !== undefined ? updateData.isPublic : trip.isPublic;
  trip.status = updateData.status || trip.status;
  trip.coverImage = updateData.coverImage || trip.coverImage;
  trip.travelStyle = updateData.travelStyle || trip.travelStyle;

  if (updateData.budget !== undefined) {
    trip.budget = typeof updateData.budget === 'number' 
      ? updateData.budget 
      : parseFloat(String(updateData.budget).replace(/[^0-9.]/g, '')) || 0;
  }
  
  if (updateData.collaborators) {
    trip.collaborators = updateData.collaborators;
  }

  if (updateData.packingList) {
    trip.packingList = updateData.packingList;
  }

  await trip.save();
  return trip;
};

export const deleteTrip = async (tripId, userId, userRole) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new AppError('Trip not found.', 404);
  }

  if (trip.userId.toString() !== userId.toString() && userRole !== 'Admin') {
    throw new AppError('You do not have permission to delete this trip.', 403);
  }

  // Delete associated Days and Activities
  await TripDay.deleteMany({ tripId });
  await Activity.deleteMany({ tripId });
  await Trip.findByIdAndDelete(tripId);

  return { id: tripId };
};
