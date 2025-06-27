import { DashboardCardModel } from "../user-settings/user.settings.model";
import { SaldosBaseRepository } from '../common/saldos-base.repository';
import { UserSettingsRepository } from "../user-settings/user-settings.repository";
import { DashboardData } from "shared";

export class DashboardRepository extends SaldosBaseRepository {
    private userSettingsRepository: UserSettingsRepository;

    constructor() {
        super();
        this.userSettingsRepository = new UserSettingsRepository();
    }

    async loadDashboardCardsData(userId: string, oficina: string): Promise<DashboardData[]> {
        const cards = await this.loadUserCards(userId);
        const data: DashboardData[] = [];
        for (const card of cards) {
            const resultado = await this.obtenerSaldosContables(oficina, [card.accountCode], 'DashboardRepository');
            if (resultado == null) continue;
            resultado.title = card.accountName;
            data.push(resultado);
        }
        return data;
    }


    async loadUserCards(userId: string): Promise<DashboardCardModel[]> {
        const cards = await this.userSettingsRepository.loadDashboardCards(userId);
        return cards;
    }
}
