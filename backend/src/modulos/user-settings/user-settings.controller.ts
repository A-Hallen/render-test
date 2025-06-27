import { Request, Response } from "express";
import { UserSettingsService } from "./user-settings.service";
import { UserSettingsDashBoardResponse } from "shared/src/types/user-settings.types";

export class UserSettingsController {
    private userSettingsService: UserSettingsService;
    
    constructor() {
        this.userSettingsService = new UserSettingsService();
    }
    
    async loadDashboardCards(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.uid;
            
            if (!userId) {
                res.status(401).json({ message: 'No autenticado' });
                return;
            }
            
            const cards = await this.userSettingsService.loadDashboardCards(userId);
            const response: UserSettingsDashBoardResponse = {
                message: 'Dashboard cards loaded successfully',
                status: 'success',
                dashboardCards: cards
            };
            res.status(200).json(response);
        } catch (error) {
            const response: UserSettingsDashBoardResponse = {
                message: 'Error al cargar configuración',
                status: 'error'
            };
            console.error('Error al cargar configuración', error);
            res.status(500).json(response);
        }
    }

    async saveDashboardCards(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.uid;
            
            if (!userId) {
                res.status(401).json({ message: 'No autenticado' });
                return;
            }
            
            const cards = req.body;
            await this.userSettingsService.saveDashboardCards(userId, cards);
            res.status(200).json({
                message: 'Dashboard cards saved successfully',
                status: 'success'
            });
        } catch (error) {
            console.error('Error al guardar configuración', error);
            res.status(500).json({
                message: 'Error al guardar configuración',
                status: 'error'
            });
        }
    }
}