import * as aiService from './ai.service.js';
import { AIHistory } from './aiHistory.model.js';
import { ChatHistory } from './chatHistory.model.js';
import { Trip } from '../trips/trip.model.js';
import { TripDay } from '../itinerary/tripDay.model.js';
import { Activity } from '../itinerary/activity.model.js';
import { getTripById } from '../trips/trip.service.js';
import { successResponse } from '../../utils/response.js';
import { AppError } from '../../utils/appError.js';

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

    // Fetch full populated trip object
    const fullTripObj = await getTripById(tripId, req.user.id, req.user.role);

    const updatedItinerary = await aiService.regenerateItinerary(fullTripObj, instruction);

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return next(new AppError('Trip not found.', 404));
    }

    // Save core trip record details
    trip.title = updatedItinerary.title || trip.title;
    trip.budget = parseFloat(String(updatedItinerary.estimatedBudget || updatedItinerary.budget || trip.budget).replace(/[^0-9.]/g, '')) || 0;
    trip.packingList = (updatedItinerary.packingList || []).map(item => 
      typeof item === 'string' ? { item, packed: false } : item
    );
    trip.travelTips = updatedItinerary.travelTips || trip.travelTips;
    await trip.save();

    // Rebuild the sub-collections for Days & Activities
    await TripDay.deleteMany({ tripId });
    await Activity.deleteMany({ tripId });

    const itinerary = updatedItinerary.itinerary || [];
    for (const dayObj of itinerary) {
      const dayNum = dayObj.day || dayObj.dayNumber;
      const tripDay = await TripDay.create({
        tripId,
        dayNumber: dayNum,
        date: dayObj.date || null,
        weatherSummary: dayObj.weatherSummary || {},
      });

      const times = ['morning', 'afternoon', 'evening'];
      for (const time of times) {
        const act = dayObj[time];
        if (act) {
          await Activity.create({
            tripId,
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

    const user = req.currentUser;
    user.usedToday += 1;
    await user.save();

    await AIHistory.create({
      userId: user._id,
      prompt: `Regenerate trip ${tripId} with instruction: ${instruction}`,
      responseSummary: `Regenerated trip to ${trip.destination} with instruction: ${instruction}.`,
    });

    const finalUpdatedTrip = await getTripById(tripId, req.user.id, req.user.role);
    return successResponse(res, 'Itinerary regenerated successfully.', finalUpdatedTrip, 200);
  } catch (error) {
    next(error);
  }
};

export const chat = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { message } = req.body;
    
    if (!message) {
      return next(new AppError('Message is required.', 400));
    }

    const result = await aiService.chatCopilot(tripId, message, req.user.id);
    return successResponse(res, 'Travel Copilot reply fetched.', result, 200);
  } catch (error) {
    next(error);
  }
};

export const optimize = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const result = await aiService.optimizeRoute(tripId, req.user.id);
    return successResponse(res, 'Route optimization complete.', result, 200);
  } catch (error) {
    next(error);
  }
};

export const budgetAdvice = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const result = await aiService.getBudgetAdvice(tripId, req.user.id);
    return successResponse(res, 'Budget advice generated.', result, 200);
  } catch (error) {
    next(error);
  }
};

export const getChatHistory = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const history = await ChatHistory.find({ tripId, userId: req.user.id }).sort({ createdAt: 1 });
    return successResponse(res, 'Chat history fetched.', { history }, 200);
  } catch (error) {
    next(error);
  }
};
