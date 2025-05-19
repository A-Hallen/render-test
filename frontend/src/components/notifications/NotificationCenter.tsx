import React from 'react';
import { X, Bell, Check, AlertCircle, Info } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, clearAll } = useNotification();
  
  if (!isOpen) return null;
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="text-green-500" size={18} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={18} />;
      case 'warning':
        return <AlertCircle className="text-yellow-500" size={18} />;
      default:
        return <Info className="text-blue-500" size={18} />;
    }
  };
  
  return (
    <div className="fixed inset-y-0 right-0 w-80 md:w-96 bg-white shadow-lg z-50 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell size={20} />
          <h2 className="text-lg font-semibold">Notificaciones</h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {notifications.filter(n => !n.read).length}
          </span>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Bell size={40} className="mb-2 opacity-20" />
            <p>No hay notificaciones</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 hover:bg-gray-50 ${notification.read ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-gray-400">{notification.time}</p>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Marcar como leída
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={clearAll}
          className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-md"
        >
          Limpiar todas
        </button>
      </div>
    </div>
  );
};