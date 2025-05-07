import { Router } from 'express';
import { GraphController } from '../controllers/graph.controller.js';
import { DoctorGuard } from '../middleware/doctor.guard.js';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard.js';
import { SelfGuard } from '../middleware/self-admin.guard.js';

const router = Router();
const controller = new GraphController();

router
  .post('/', DoctorGuard, JwtAuthGuard, controller.createGraph)
  .get('/', controller.getAllGraphs)
  .get('/:id', controller.getGraphById)
  .patch('/:id', JwtAuthGuard, SelfGuard, controller.updateGraphById)
  .delete(
    '/:id',
    JwtAuthGuard,
    DoctorGuard,
    SelfGuard,
    controller.deleteGraphById
  );

export default router;
