import { Router } from 'express';
import * as aiController from '../controllers/ai.controller.js';
import { auth } from '../middlewares/auth.middleware.js';
import { checkAiLimits } from '../middlewares/aiLimit.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { generateSchema, regenerateSchema } from '../validators/ai.validator.js';

const router = Router();

router.use(auth);

router.post('/generate', checkAiLimits, validate(generateSchema), aiController.generate);
router.post('/regenerate', checkAiLimits, validate(regenerateSchema), aiController.regenerate);

export default router;
