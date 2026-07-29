import { Router } from 'express';
import * as notificationController from './notification.controller.js';
import { auth } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(auth);

router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.readNotification);
router.post('/read-all', notificationController.readAllNotifications);

export default router;
