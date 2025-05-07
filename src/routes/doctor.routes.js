import { Router } from 'express';
import { DoctorController } from '../controllers/doctor.controller.js';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard.js';
import { AdminGuard } from '../middleware/admin.guard.js';
import { SelfGuard } from '../middleware/self-admin.guard.js';

const router = Router();
const controller = new DoctorController();

router
  .post('/', JwtAuthGuard, AdminGuard, controller.createDoctor)
  .post('/signin', controller.signinDoctor)
  .post('/confirm-signin', controller.confirmSigninDoctor)
  .post('/token', controller.acceessToken)
  .post('/signout', controller.signoutDoctor)
  .get('/', controller.getAllDoctors)
  .get('/:id', controller.getDoctorById)
  .patch('/:id', JwtAuthGuard, SelfGuard, controller.updateDoctorById)
  .delete('/:id', JwtAuthGuard, AdminGuard, controller.deleteDoctorById);

export default router;
