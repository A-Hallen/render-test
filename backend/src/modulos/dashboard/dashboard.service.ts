import { DashboardData } from "shared";
import { DashboardRepository } from "./dashboard.repository";

export class DashboardService {
    private dashboardRepository: DashboardRepository;

    constructor() {
        this.dashboardRepository = new DashboardRepository();
    }

    async loadDashboardCards(userId: string, oficina: string): Promise<DashboardData[]> {
        return this.dashboardRepository.loadDashboardCardsData(userId, oficina);
    }
}
