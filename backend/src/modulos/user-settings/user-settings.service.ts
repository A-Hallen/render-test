import { UserSettingsRepository } from "./user-settings.repository";
import { DashboardCardModel } from "./user.settings.model";

export class UserSettingsService {
    private userSettingsRepository: UserSettingsRepository;

    constructor() {
        this.userSettingsRepository = new UserSettingsRepository();
    }

    async loadDashboardCards(userId: string): Promise<DashboardCardModel[]> {
        return this.userSettingsRepository.loadDashboardCards(userId);
    }

    async saveDashboardCards(userId: string, cards: DashboardCardModel[]): Promise<void> {
        return this.userSettingsRepository.saveDashboardCards(userId, cards);
    }
}
