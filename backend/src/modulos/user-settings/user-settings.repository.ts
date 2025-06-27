import { BaseFirebaseRepository } from "../../base/base.firebaseRepository";
import { DashboardCardModel, UserSettingsModel } from "./user.settings.model";

export class UserSettingsRepository extends BaseFirebaseRepository<UserSettingsModel> {
    constructor() {
        super('user-settings');
    }
    
    async loadDashboardCards(userId: string): Promise<DashboardCardModel[]> {
        const querySnapshot = await this.collection.where('userId', '==', userId).limit(1).get();
        if (querySnapshot.empty) {
            return [];
        } else {
            const cards = querySnapshot.docs[0].data().dashboardCards;
            cards.sort((a: DashboardCardModel, b: DashboardCardModel) => a.order - b.order);
            return cards;
        }
    }

    async saveDashboardCards(userId: string, cards: DashboardCardModel[]): Promise<void> {
        const querySnapshot = await this.collection.where('userId', '==', userId).limit(1).get();
        if (querySnapshot.empty) {
            await this.collection.add({ userId, dashboardCards: cards });
        } else {
            await querySnapshot.docs[0].ref.update({ dashboardCards: cards });
        }
    }
}
