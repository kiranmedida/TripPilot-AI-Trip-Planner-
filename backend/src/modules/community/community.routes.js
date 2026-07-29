import { Router } from 'express';
import * as communityController from './community.controller.js';
import { auth } from '../../middlewares/auth.middleware.js';

const router = Router();

// Public feed is accessible without login to improve landing discovery, but auth is required for mutating actions
router.get('/feed', communityController.getFeed);
router.get('/:templateId/comments', communityController.getComments);

// Auth required routes
router.use(auth);

router.post('/share/:tripId', communityController.share);
router.post('/duplicate/:templateId', communityController.duplicate);
router.post('/:templateId/like', communityController.like);
router.post('/:templateId/comment', communityController.comment);

export default router;
