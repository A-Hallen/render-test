import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { useNotification } from '../../context/NotificationContext';

export const Layout: React.FC = () => {
  const { showNotifications, toggleNotifications } = useNotification();
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleNotifications={toggleNotifications} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => toggleNotifications(false)} 
      />
    </div>
  );
};