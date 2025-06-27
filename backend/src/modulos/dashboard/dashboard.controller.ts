import { Request, Response } from "express";
import { DashboardService } from "./dashboard.service";
import { DashboardCardDataResponse } from "shared";

export class DashBoardController {
    private dashboardService: DashboardService;
    
    constructor() {
        this.dashboardService = new DashboardService();
    }
    
    async loadDashboardCards(req: Request, res: Response): Promise<void> {
        const userId = req.user?.uid;
        const codigoOficina = req.query.oficina as string;
        
        if (!userId) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        
        const cards = await this.dashboardService.loadDashboardCards(userId, codigoOficina);
        const response: DashboardCardDataResponse = {
            message: 'Dashboard cards loaded successfully',
            status: 'success',
            dashboardCards: cards
        };
        res.status(200).json(response);
    }
}