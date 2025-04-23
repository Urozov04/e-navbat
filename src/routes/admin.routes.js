import { Router } from "express";
import { AdminController } from '../controllers/admin.controller.js';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard.js';
import { SuperAdminGuard } from "../middleware/superadmin.guard.js";
import { SelfGuard } from '../middleware/self-admin.guard.js';

const router = Router();
const controller = new AdminController();

router
    .post('/superadmin', controller.createSuperAdmin)
    .post('/', JwtAuthGuard, SuperAdminGuard, controller.createAdmin)
    .post('/signin', controller.signinAdmin)
    .get('/', JwtAuthGuard, SuperAdminGuard, controller.getAllAdmins)
    .get('/:id', JwtAuthGuard, SelfGuard, controller.getAdminById)
    .patch('/:id', JwtAuthGuard, SelfGuard, controller.updateAdminById)
    .delete('/:id', JwtAuthGuard, SuperAdminGuard, controller.deleteAdminById);

export default router;
