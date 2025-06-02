import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { useNotification } from '../../context/NotificationContext';
import N8nChatWidget from '../chat/N8nChatWidget';

export const Layout: React.FC = () => {
  const { showNotifications, toggleNotifications } = useNotification();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Toggle sidebar function
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  
  // Check for mobile screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-collapse sidebar on mobile
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Check on initial render
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        toggleSidebar={toggleSidebar} 
        isMobile={isMobile}
        setCollapsed={setSidebarCollapsed}
      />
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
      <N8nChatWidget />
    </div>
  );
};