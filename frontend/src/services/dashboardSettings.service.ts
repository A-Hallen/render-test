import { DashboardCard, UserSettingsDashBoardResponse } from "shared";
import { httpClient } from "./httpClient";


export const saveDashboardCards = async (cards: DashboardCard[]): Promise<void> => {
    await httpClient.post('/api/user-settings/dashboard/cards', cards);
};

export const loadDashboardCards = async (): Promise<DashboardCard[] | null> => {
  const response: UserSettingsDashBoardResponse = await httpClient.get('/api/user-settings/dashboard/cards');
  return response.dashboardCards || null;
};
