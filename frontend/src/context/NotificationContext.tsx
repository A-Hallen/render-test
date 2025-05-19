import React, { createContext, useContext, useState } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  time: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'time' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  showNotifications: boolean;
  toggleNotifications: (state: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Informe generado',
      message: 'El informe financiero mensual ha sido generado correctamente.',
      type: 'success',
      time: '10:30 AM',
      read: false,
    },
    {
      id: '2',
      title: 'Índice de morosidad',
      message: 'El índice de morosidad ha superado el umbral definido del 3.5%.',
      type: 'warning',
      time: 'Ayer',
      read: false,
    },
    {
      id: '3',
      title: 'Actualización del sistema',
      message: 'Nueva versión disponible. Se instalará automáticamente esta noche.',
      type: 'info',
      time: '25/06/2025',
      read: true,
    },
  ]);
  
  const [showNotifications, setShowNotifications] = useState(false);
  
  const addNotification = (notification: Omit<Notification, 'id' | 'time' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };
  
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };
  
  const clearAll = () => {
    setNotifications([]);
  };
  
  const toggleNotifications = (state: boolean) => {
    setShowNotifications(state);
  };
  
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        clearAll,
        showNotifications,
        toggleNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};