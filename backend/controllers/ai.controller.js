import * as aiService from '../services/ai.service.js';
import { AIHistory } from '../models/aiHistory.model.js';
import { Trip } from '../models/trip.model.js';
import { successResponse } from '../utils/response.js';
import { AppError } from '../utils/appError.js';

export const generate = async (req, res, next) => {
  try {
    const { destination, budget, days, travelStyle, tripTemplate } = req.body;
    
    const itinerary = await aiService.generateItinerary({
      destination,
      budget,
      days,
      travelStyle,
      tripTemplate,
    });

    const user = req.currentUser;
    user.usedToday += 1;
    await user.save();

    await AIHistory.create({
      userId: user._id,
      prompt: JSON.stringify({ destination, budget, days, travelStyle, tripTemplate }),
      responseSummary: `Generated ${days}-day itinerary to ${destination} using ${tripTemplate} template.`,
    });

    return successResponse(res, 'Itinerary generated successfully.', {
      itinerary,
      remainingLimits: user.role === 'User' ? user.dailyLimit - user.usedToday : 'Unlimited',
    }, 200);
  } catch (error) {
    next(error);
  }
};

export const regenerate = async (req, res, next) => {
  try {
    const { tripId, instruction } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return next(new AppError('Trip not found.', 404));
    }

    // Auth check: user must own the trip or be an Admin
    if (trip.userId.toString() !== req.user.id.toString() && req.user.role !== 'Admin') {
      return next(new AppError('You do not have permission to modify this trip.', 403));
    }

    const updatedItinerary = await aiService.regenerateItinerary(trip, instruction);

    // Save modifications back to the Trip database record
    trip.title = updatedItinerary.title;
    trip.budget = updatedItinerary.estimatedBudget || updatedItinerary.budget || trip.budget;
    trip.itinerary = updatedItinerary.itinerary;
    trip.packingList = updatedItinerary.packingList;
    trip.travelTips = updatedItinerary.travelTips;
    await trip.save();

    // Increment user limits
    const user = req.currentUser;
    user.usedToday += 1;
    await user.save();

    // Log AI History
    await AIHistory.create({
      userId: user._id,
      prompt: `Regenerate trip ${tripId} with instruction: ${instruction}`,
      responseSummary: `Regenerated trip to ${trip.destination} with instruction: ${instruction}.`,
    });

    return successResponse(res, 'Itinerary regenerated successfully.', trip, 200);
  } catch (error) {
    next(error);
  }
};
