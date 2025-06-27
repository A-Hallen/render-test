import { Router } from 'express';
import { AuthMiddleware } from "../auth";
import { DashBoardController } from './dashboard.controller';

const router = Router();
const authMiddleware = new AuthMiddleware();
const dashboardController = new DashBoardController();

router.get('/cards', authMiddleware.verifyToken.bind(authMiddleware), 
    dashboardController.loadDashboardCards.bind(dashboardController));

export default router;      