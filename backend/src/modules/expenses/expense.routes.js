import { Router } from 'express';
import * as expenseController from './expense.controller.js';
import { auth } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(auth);

router.post('/trip/:tripId', expenseController.create);
router.get('/trip/:tripId', expenseController.getExpenses);
router.delete('/:id', expenseController.remove);

export default router;
