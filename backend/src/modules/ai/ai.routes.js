import { Router } from 'express';
import * as aiController from './ai.controller.js';
import { auth } from '../../middlewares/auth.middleware.js';
import { checkAiLimits } from '../../middlewares/aiLimit.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { generateSchema, regenerateSchema } from '../../../validators/ai.validator.js';

const router = Router();

router.use(auth);

// Itinerary generation
router.post('/generate', checkAiLimits, validate(generateSchema), aiController.generate);
router.post('/regenerate', checkAiLimits, validate(regenerateSchema), aiController.regenerate);

// Real-time travel OS features
router.get('/chat/:tripId', aiController.getChatHistory);
router.post('/chat/:tripId', aiController.chat);
router.post('/optimize-route/:tripId', aiController.optimize);
router.post('/budget-advice/:tripId', aiController.budgetAdvice);

export default router;
