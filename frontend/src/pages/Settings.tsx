import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from 'shared/src/types/auth.types';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { KpiFormulaEditor } from '../components/settings/KpiFormulaEditor';
import { UserManagement } from '../components/settings/UserManagement';
import { SecuritySettings } from '../pages/settings/SecuritySettings';
import { NotificationSettings } from '../pages/settings/NotificationSettings';
import { ThresholdsSettings } from '../pages/settings/ThresholdsSettings';
import { DataSourceSettings } from '../pages/settings/DataSourceSettings';
import { CooperativaConfig } from '../components/settings/cooperativa';

export const Settings: React.FC = () => {
  const {user} = useAuth();
  const location = useLocation();
  
  if (user?.role !== UserRole.ADMIN && !location.pathname.includes('/settings/user')) {
    return <Navigate to="/settings/user" replace />;
  }

  return (
    <div className="container mx-auto">
      <div className="rounded-lg overflow-hidden">
        <div className="p-6 overflow-auto">
          <Routes>
                {user?.role === UserRole.ADMIN && (
                  <Route path="general" element={<CooperativaConfig canEditCooperativa={user?.role === UserRole.ADMIN} />} />
                )}
                <Route path="indicadores" element={<KpiFormulaEditor />} />
                <Route path="user" element={<UserManagement />} />
                <Route path="security" element={<SecuritySettings />} />
                <Route path="notifications" element={<NotificationSettings />} />
                <Route path="thresholds" element={<ThresholdsSettings />} />
                <Route path="dataSource" element={<DataSourceSettings />} />
                <Route index element={<Navigate to={user?.role === UserRole.ADMIN ? "general" : "user"} replace />} />
                <Route path="*" element={<Navigate to={user?.role === UserRole.ADMIN ? "general" : "user"} replace />} />
              </Routes>
        </div>
      </div>
    </div>
  );
};