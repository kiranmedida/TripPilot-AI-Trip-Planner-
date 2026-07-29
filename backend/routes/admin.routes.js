import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { auth, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { changeRoleSchema } from '../validators/admin.validator.js';

const router = Router();

router.use(auth);
router.use(authorize('Admin'));

router.get('/users', adminController.getUsers);
router.patch('/users/:id/role', validate(changeRoleSchema), adminController.changeRole);
router.patch('/users/:id/reset-limit', adminController.resetLimit);
router.delete('/users/:id', adminController.removeUser);
router.get('/trips', adminController.getTrips);

export default router;
