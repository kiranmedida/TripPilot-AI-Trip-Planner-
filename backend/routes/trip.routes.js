import { Router } from 'express';
import * as tripController from '../controllers/trip.controller.js';
import { auth } from '../middlewares/auth.middleware.js';
import { checkTripLimit } from '../middlewares/tripLimit.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createTripSchema, updateTripSchema } from '../validators/trip.validator.js';

const router = Router();

router.use(auth);

router.post('/', checkTripLimit, validate(createTripSchema), tripController.create);
router.get('/', tripController.getAll);
router.get('/:id', tripController.getOne);
router.put('/:id', validate(updateTripSchema), tripController.update);
router.delete('/:id', tripController.remove);

export default router;
