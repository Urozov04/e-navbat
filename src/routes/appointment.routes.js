import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller.js';

const router = Router();
const controller = new AppointmentController();

router
  .post('/', controller.createAppointment)
  .get('/', controller.getAllApointments)
  .get('/:id', controller.getAppointmentById)
  .patch('/:id', controller.updateAppointmentById)
  .delete('/:id', controller.deleteAppointmentById);

export default router;
