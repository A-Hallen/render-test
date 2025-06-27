import { Router } from 'express';
import { AuthMiddleware } from "../auth";
import { UserSettingsController } from './user-settings.controller';

const router = Router();
const authMiddleware = new AuthMiddleware();
const userSettingsController = new UserSettingsController();

router.get('/dashboard/cards', authMiddleware.verifyToken.bind(authMiddleware), 
    userSettingsController.loadDashboardCards.bind(userSettingsController));

router.post('/dashboard/cards', authMiddleware.verifyToken.bind(authMiddleware), 
    userSettingsController.saveDashboardCards.bind(userSettingsController));

export default router;