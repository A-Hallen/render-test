export interface DashboardCard {
    accountCode: string;
    accountName: string;
    visible: boolean;
    order: number;
}

export interface UserSettingsDashBoardResponse {
    message: string;
    status: "success" | "error";
    dashboardCards?: DashboardCard[];
}
    