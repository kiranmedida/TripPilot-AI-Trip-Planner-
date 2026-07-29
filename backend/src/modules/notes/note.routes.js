import { Router } from 'express';
import * as noteController from './note.controller.js';
import { auth } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(auth);

router.post('/trip/:tripId', noteController.create);
router.get('/trip/:tripId', noteController.getNotes);
router.put('/:id', noteController.update);
router.delete('/:id', noteController.remove);

export default router;
