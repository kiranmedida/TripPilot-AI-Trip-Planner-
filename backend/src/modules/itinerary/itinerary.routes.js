import { Router } from 'express';
import * as itineraryController from './itinerary.controller.js';
import { auth } from '../../middlewares/auth.middleware.js';

const router = Router();

// Routes for activity management
router.patch('/activities/:activityId/toggle', auth, itineraryController.toggleCompletion);
router.put('/activities/:activityId', auth, itineraryController.updateActivity);

// Routes for day management
router.put('/days/:dayId/weather', auth, itineraryController.updateWeather);

export default router;
