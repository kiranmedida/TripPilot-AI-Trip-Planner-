import { Router } from 'express';
import * as goalController from './goal.controller.js';
import { auth } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(auth);

router.get('/', goalController.getGoals);
router.get('/achievements', goalController.getAchievements);
router.post('/check', goalController.checkProgress);

export default router;
