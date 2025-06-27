export interface DashboardCardModel {
    accountCode: string;
    accountName: string;
    visible: boolean;
    order: number;
}

export interface UserSettingsModel {
    userId: string;
    dashboardCards: DashboardCardModel[];
}