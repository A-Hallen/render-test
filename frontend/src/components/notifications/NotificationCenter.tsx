import React, { useEffect, useRef, useCallback, useState } from 'react';
import { X, Bell, Check, AlertCircle, Info, BellOff, AlertTriangle, Loader, Trash2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    markNotificationAsRead, 
    clearAllNotifications, 
    notificationsEnabled, 
    requestNotificationPermission,
    markAllNotificationsAsRead,
    loadMoreNotifications,
    isLoading,
    hasMoreNotifications,
    unreadCount,
    error
  } = useNotification();
  
  const { user, isAuthenticated } = useAuth();
  
  const [isVisible, setIsVisible] = useState(isOpen);
  const [isRendered, setIsRendered] = useState(isOpen);
  const [notificationToRemove, setNotificationToRemove] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasMoreNotifications && !isLoading) {
      loadMoreNotifications();
    }
  }, [hasMoreNotifications, isLoading, loadMoreNotifications]);
  
  useEffect(() => {
    if (isOpen) {
      setLocalError(null);
      
      if ('Notification' in window) {
        const actualPermission = Notification.permission === 'granted';
        
        if (actualPermission !== notificationsEnabled) {
          window.dispatchEvent(new CustomEvent('checkNotificationPermission'));
        }
      }
      
      if (isAuthenticated && user) {
        import('../../services/NotificationService').then(({ default: NotificationService }) => {
          const refreshNotifications = async () => {
            try {
              const refreshedNotifications = await NotificationService.getUserNotifications(user.uid, { limit: 10 });
              window.dispatchEvent(new CustomEvent('refreshNotifications', { 
                detail: { notifications: refreshedNotifications } 
              }));
              setLocalError(null);
            } catch (error: any) {
              console.error('Error al refrescar notificaciones:', error);
              setLocalError(error?.message || 'Error al cargar notificaciones');
            }
          };
          
          refreshNotifications();
        });
      }
    }
  }, [isOpen, isAuthenticated, user, notificationsEnabled]);
  
  useEffect(() => {
    if (!isOpen) return;
    
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    observerRef.current = new IntersectionObserver(handleObserver, options);
    
    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isOpen, handleObserver, hasMoreNotifications]);
  
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      setTimeout(() => setIsRendered(false), 300);
    }
  }, [isOpen]);
  
  if (!isRendered) return null;
  
  const getIcon = (type?: string) => {
    switch (type) {
      case 'success':
        return <Check className="text-green-500" size={18} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={18} />;
      case 'warning':
        return <AlertTriangle className="text-amber-500" size={18} />;
      case 'info':
      default:
        return <Info className="text-blue-500" size={18} />;
    }
  };
  
  // Función para formatear la fecha de manera más elegante
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 1) return 'Justo ahora';
    if (diffMins < 60) return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    if (diffDays < 7) return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    
    return date.toLocaleDateString(undefined, { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  const handleMarkAsRead = (id: string) => {
    setNotificationToRemove(id);
    setTimeout(() => {
      markNotificationAsRead(id);
      setNotificationToRemove(null);
    }, 300);
  };
  
  return (
    <div 
      className={`fixed inset-y-0 right-0 w-80 md:w-96 bg-white shadow-xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ boxShadow: '0 0 25px rgba(0, 0, 0, 0.15)', willChange: 'transform' }}
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center space-x-2">
          {notificationsEnabled ? 
            <Bell size={20} className="text-blue-600" /> : 
            <BellOff size={20} className="text-gray-400" />
          }
          <h2 className="text-lg font-semibold text-gray-800">Notificaciones</h2>
          {unreadCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>
        <button 
          onClick={onClose} 
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full transition-colors duration-200"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {(error || localError) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex items-center">
              <AlertCircle size={20} className="text-red-500 mr-2" />
              <p className="text-sm text-red-700">
                {error || localError}
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-xs text-red-700 hover:text-red-900 font-medium underline"
            >
              Intentar de nuevo
            </button>
          </div>
        )}
        
        {isLoading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 py-12">
            <Loader size={32} className="animate-spin text-blue-600 mb-4" />
            <p className="text-gray-500">Cargando notificaciones...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
            <Bell size={48} className="mb-3 opacity-20 animate-[pulse_3s_ease-in-out_infinite]" />
            <p className="text-center">No hay notificaciones</p>
            <p className="text-xs text-gray-400 mt-2 text-center">Las notificaciones aparecerán aquí cuando las recibas</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 hover:bg-gray-50 transition-all duration-300 ${notification.read ? 'bg-gray-50 opacity-70' : 'bg-white'} ${notificationToRemove === notification.id ? 'opacity-0 transform -translate-x-full' : ''}`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5 p-1.5 rounded-full bg-opacity-20" 
                    style={{
                      backgroundColor: notification.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 
                                      notification.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 
                                      notification.type === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 
                                      'rgba(59, 130, 246, 0.1)'
                    }}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="mt-1 text-sm text-gray-600">{notification.body}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-gray-400">{formatDate(notification.timestamp)}</p>
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 hover:underline"
                        >
                          Marcar como leída
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Elemento para detectar cuando llegar al final y cargar más */}
            <div ref={loadingRef} className="py-2 text-center">
              {isLoading && (
                <div className="flex items-center justify-center py-4">
                  <Loader size={20} className="animate-spin text-blue-600" />
                  <span className="ml-2 text-sm text-gray-500">Cargando...</span>
                </div>
              )}
              {!hasMoreNotifications && notifications.length > 0 && (
                <p className="text-xs text-gray-400 py-4 border-t border-gray-100">No hay más notificaciones</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 gap-2">
          {!notificationsEnabled && (
            <button
              onClick={() => requestNotificationPermission()}
              className="col-span-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200 flex items-center justify-center space-x-2 shadow-sm"
            >
              <Bell size={16} />
              <span>Activar notificaciones</span>
            </button>
          )}
          {notifications.length > 0 && notifications.some(n => !n.read) && (
            <button 
              onClick={markAllNotificationsAsRead}
              className="py-2 px-4 bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center space-x-1 shadow-sm"
            >
              <Check size={16} />
              <span>Marcar leídas</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button 
              onClick={clearAllNotifications}
              className={`py-2 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center space-x-1 shadow-sm ${notifications.length > 0 && !notifications.some(n => !n.read) ? 'col-span-2' : ''}`}
            >
              <Trash2 size={16} />
              <span>Limpiar todas</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};