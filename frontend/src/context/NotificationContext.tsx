import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getToken, onMessage, isSupported } from 'firebase/messaging';
import { messaging, vapidKey } from '../firebase/firebaseConfig';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
// @ts-ignore - Ignorar error de tipos para uuid
import { v4 as uuidv4 } from 'uuid';
import { NotificationPayload, NotificationMeta } from '../types/notification';
import NotificationService from '../services/NotificationService';

interface NotificationContextType {
  notifications: NotificationMeta[];
  unreadCount: number;
  addNotification: (notification: NotificationPayload) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  showNotifications: boolean;
  toggleNotifications: (state: boolean) => void;
  fcmToken: string | null;
  notificationsEnabled: boolean;
  requestNotificationPermission: () => Promise<boolean>;
  deviceId: string | null;
  markAllNotificationsAsRead: () => void;
  loadMoreNotifications: () => Promise<boolean>;
  isLoading: boolean;
  hasMoreNotifications: boolean;
  error: string | null;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Obtener el usuario actual y estado de autenticación
  const { user, isAuthenticated } = useAuth();
  // Estado para las notificaciones
  const [notifications, setNotifications] = useState<NotificationMeta[]>([]);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMoreNotifications, setHasMoreNotifications] = useState<boolean>(true);
  const [lastTimestamp, setLastTimestamp] = useState<number | null>(null);
  const [pageSize] = useState<number>(10); // Número de notificaciones por página
  const [error, setError] = useState<string | null>(null);
  
  // Obtener o generar un ID de dispositivo único y persistente
  useEffect(() => {
    // Intentar recuperar el ID de dispositivo del localStorage
    const storedDeviceId = localStorage.getItem('deviceId');
    
    // Si no existe, generar uno nuevo
    if (!storedDeviceId) {
      const newDeviceId = uuidv4();
      localStorage.setItem('deviceId', newDeviceId);
      setDeviceId(newDeviceId);
    } else {
      setDeviceId(storedDeviceId);
    }
  }, []);
  
  // Verificar el estado actual de los permisos de notificaciones
  const checkNotificationPermission = useCallback(async () => {
    try {
      // Verificar si el navegador soporta notificaciones
      if (!('Notification' in window)) {
        setNotificationsEnabled(false);
        return false;
      }
      
      // Verificar el estado actual del permiso
      const currentPermission = Notification.permission;
      const isEnabled = currentPermission === 'granted';
      
      // Actualizar el estado
      setNotificationsEnabled(isEnabled);
      
      // Si el permiso está concedido pero no tenemos token, intentar obtenerlo
      if (isEnabled && !fcmToken && messaging) {
        const isFCMSupported = await isSupported();
        
        if (isFCMSupported) {
          try {
            const currentToken = await getToken(messaging, { vapidKey });
            if (currentToken) {
              setFcmToken(currentToken);
              localStorage.setItem('fcmToken', currentToken);
            }
          } catch (error) {
            console.error('Error al recuperar token FCM:', error);
          }
        }
      }
      
      return isEnabled;
    } catch (error) {
      console.error('Error al verificar permisos de notificación:', error);
      return false;
    }
  }, [fcmToken]);
  
  // Verificar permisos solo cuando sea necesario
  useEffect(() => {
    // Verificar permisos al inicio
    checkNotificationPermission();
    
    // Escuchar evento para verificar permisos (disparado desde NotificationCenter)
    const handleCheckPermission = () => {
      checkNotificationPermission();
    };
    
    window.addEventListener('checkNotificationPermission', handleCheckPermission);
    
    // Limpiar listener
    return () => {
      window.removeEventListener('checkNotificationPermission', handleCheckPermission);
    };
  }, [checkNotificationPermission]);
  
  // Función para enviar el token FCM al backend
  const sendTokenToBackend = async (token: string, userId?: string) => {
    try {
      // Si no hay deviceId, no podemos continuar
      if (!deviceId) {
        console.warn('No hay ID de dispositivo disponible');
        return;
      }
      
      // Usar el servicio de notificaciones para registrar el token
      await NotificationService.registerToken(token, userId, deviceId);
      console.log('Token FCM registrado correctamente');
    } catch (error) {
      console.error('Error al registrar token FCM:', error);
    }  // No mostramos error al usuario ya que esto es un proceso en segundo plano
  };
  
  // Función para solicitar permiso para notificaciones y obtener el token FCM
  const requestNotificationPermission = async (): Promise<boolean> => {
    try {
      // Verificar el estado actual del permiso primero
      if (Notification.permission === 'granted') {
        // Ya tenemos permiso, solo verificamos el token
        if (fcmToken) {
          // Ya tenemos token, todo está configurado
          setNotificationsEnabled(true);
          return true;
        }
      }
      
      // Verificar si FCM es compatible con este navegador
      const isFCMSupported = await isSupported();
      
      if (!isFCMSupported) {
        console.warn('Firebase Cloud Messaging no es compatible con este navegador');
        return false;
      }
      
      if (!messaging) {
        console.warn('Firebase Messaging no está inicializado');
        return false;
      }

      // Solicitar permiso de notificación
      const permission = await Notification.requestPermission();
      const permissionGranted = permission === 'granted';
      
      setNotificationsEnabled(permissionGranted);
      
      if (permissionGranted) {
        try {
          // Obtener token FCM
          const currentToken = await getToken(messaging, {
            vapidKey: vapidKey,
          });
          
          if (currentToken) {
            console.log('Token FCM obtenido:', currentToken);
            setFcmToken(currentToken);
            
            // Guardar el token en localStorage para persistencia
            localStorage.setItem('fcmToken', currentToken);
            
            // Enviar el token al backend
            if (isAuthenticated && user) {
              // Si el usuario está autenticado, asociar el token con su cuenta
              sendTokenToBackend(currentToken, user.uid);
            } else {
              // Si no está autenticado, guardar como token anónimo
              sendTokenToBackend(currentToken);
            }
            
            return true;
          } else {
            console.warn('No se pudo obtener el token FCM');
            return false;
          }
        } catch (error) {
          console.error('Error al obtener el token FCM:', error);
          return false;
        }
      } else {
        console.warn('Permiso de notificación denegado');
        return false;
      }
    } catch (error) {
      console.error('Error al solicitar permiso de notificación:', error);
      return false;
    }
  };
  
  // Función para añadir una nueva notificación
  const addNotification = (notification: NotificationPayload) => {
    const newNotification: NotificationMeta = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false,
    };
    
    // Añadir a la lista de notificaciones
    setNotifications(prev => [newNotification, ...prev]);
    
    // Actualizar el contador de notificaciones no leídas
    setUnreadCount(prev => prev + 1);
    
    // Mostrar toast si no está abierto el centro de notificaciones
    if (!showNotifications) {
      toast.custom(
        (t) => (
          <div 
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  {getNotificationIcon(notification.type || 'info')}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                  <p className="mt-1 text-sm text-gray-500">{notification.body}</p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Cerrar
              </button>
            </div>
          </div>
        ),
        { duration: 5000 }
      );
    }
  };
  
  // Función para obtener el icono según el tipo de notificación
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };
  
  // Marcar una notificación como leída
  const markNotificationAsRead = async (id: string) => {
    // Buscar la notificación para obtener el userId
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;
    
    // Actualizar el estado local
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    
    // Actualizar el contador de notificaciones no leídas
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // Si el usuario está autenticado, actualizar en el backend
    if (isAuthenticated && user && notification.userId) {
      try {
        await NotificationService.markNotificationAsRead(notification.userId, id);
      } catch (error) {
        console.error('Error al marcar notificación como leída en el backend:', error);
      }
    }
  };
  
  // Limpiar todas las notificaciones
  const clearAllNotifications = async () => {
    // Actualizar estado local
    setNotifications([]);
    setUnreadCount(0);
    
    // Si el usuario está autenticado, eliminar todas las notificaciones en el backend
    if (isAuthenticated && user) {
      try {
        await NotificationService.deleteAllNotifications(user.uid);
      } catch (error) {
        console.error('Error al eliminar todas las notificaciones en el backend:', error);
      }
    }
  };
  
  // Marcar todas las notificaciones como leídas
  const markAllNotificationsAsRead = async () => {
    // Actualizar estado local
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    
    // Si el usuario está autenticado, marcar todas como leídas en el backend
    if (isAuthenticated && user) {
      try {
        await NotificationService.markAllNotificationsAsRead(user.uid);
      } catch (error) {
        console.error('Error al marcar todas las notificaciones como leídas en el backend:', error);
      }
    }
  };
  
  // Mostrar/ocultar el centro de notificaciones
  const toggleNotifications = (state: boolean) => {
    setShowNotifications(state);
  };
  
  // Efecto para recuperar el token FCM del localStorage al cargar y cargar notificaciones del usuario
  useEffect(() => {
    const savedToken = localStorage.getItem('fcmToken');
    if (savedToken) {
      setFcmToken(savedToken);
      setNotificationsEnabled(true);
    }
    
    // Cargar notificaciones del usuario si está autenticado
    if (isAuthenticated && user) {
      loadUserNotifications(user.uid);
    }
  }, [isAuthenticated, user]);
  
  // Escuchar el evento de actualización de notificaciones
  useEffect(() => {
    const handleRefreshNotifications = (event: Event) => {
      const customEvent = event as CustomEvent<{notifications: NotificationMeta[]}>;
      if (customEvent.detail && customEvent.detail.notifications) {
        setNotifications(customEvent.detail.notifications);
        
        // Actualizar contador de notificaciones no leídas
        const unreadNotifications = customEvent.detail.notifications.filter(n => !n.read).length;
        setUnreadCount(unreadNotifications);
        
        // Actualizar estado de paginación
        if (customEvent.detail.notifications.length > 0) {
          setLastTimestamp(customEvent.detail.notifications[customEvent.detail.notifications.length - 1].timestamp);
        }
        setHasMoreNotifications(customEvent.detail.notifications.length === pageSize);
      }
    };
    
    window.addEventListener('refreshNotifications', handleRefreshNotifications);
    
    return () => {
      window.removeEventListener('refreshNotifications', handleRefreshNotifications);
    };
  }, [pageSize]);
  
  // Función para cargar notificaciones del usuario desde el backend
  const loadUserNotifications = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null); // Limpiar errores anteriores
      
      const userNotifications = await NotificationService.getUserNotifications(userId, {
        limit: pageSize
      });
      
      setNotifications(userNotifications);
      setHasMoreNotifications(userNotifications.length === pageSize);
      
      if (userNotifications.length > 0) {
        setLastTimestamp(userNotifications[userNotifications.length - 1].timestamp);
      }
      
      // Actualizar contador de notificaciones no leídas
      const unreadNotifications = userNotifications.filter(n => !n.read).length;
      setUnreadCount(unreadNotifications);
    } catch (error: any) {
      console.error('Error al cargar notificaciones del usuario:', error);
      setError(error?.message || 'Error al cargar notificaciones');
      toast.error('No se pudieron cargar las notificaciones');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para cargar más notificaciones (paginación)
  const loadMoreNotifications = async (): Promise<boolean> => {
    if (!user || !lastTimestamp || !hasMoreNotifications || isLoading) return false;
    
    try {
      setIsLoading(true);
      setError(null); // Limpiar errores anteriores
      
      const moreNotifications = await NotificationService.getUserNotifications(user.uid, {
        limit: pageSize,
        endDate: lastTimestamp - 1 // Excluir la última notificación ya cargada
      });
      
      if (moreNotifications.length > 0) {
        setNotifications(prev => [...prev, ...moreNotifications]);
        setLastTimestamp(moreNotifications[moreNotifications.length - 1].timestamp);
        setHasMoreNotifications(moreNotifications.length === pageSize);
        return true;
      } else {
        setHasMoreNotifications(false);
        return false;
      }
    } catch (error: any) {
      console.error('Error al cargar más notificaciones:', error);
      setError(error?.message || 'Error al cargar más notificaciones');
      toast.error('No se pudieron cargar más notificaciones');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Efecto para enviar el token al backend cuando el usuario se autentica
  useEffect(() => {
    // Si el usuario se acaba de autenticar y ya tenemos un token FCM
    if (isAuthenticated && user && fcmToken && deviceId) {
      // Asociar el token existente con la cuenta de usuario
      sendTokenToBackend(fcmToken, user.uid);
    }
  }, [isAuthenticated, user, fcmToken, deviceId]);
  
  // Función para manejar mensajes FCM (extraída para poder reutilizarla)
  const handleFCMMessage = useCallback((payload: any) => {
    console.log('Mensaje FCM recibido:', payload);
    
    // Extraer datos de la notificación
    const { notification, data } = payload;
    
    if (notification) {
      // Crear una notificación en el sistema
      addNotification({
        title: notification.title || 'Nueva notificación',
        body: notification.body || '',
        type: (data?.type as any) || 'info',
        data: data || {},
        userId: user?.uid
      });
    }
  }, [user]);

  // Configurar el listener de mensajes FCM cuando el componente se monta
  useEffect(() => {
    if (!messaging) return;
    
    // Configurar el listener para mensajes en primer plano
    const unsubscribe = onMessage(messaging, handleFCMMessage);
    
    // Limpiar el listener cuando el componente se desmonta
    return () => {
      unsubscribe();
    };
  }, [messaging, handleFCMMessage]);
  
  // Registrar el service worker para notificaciones en segundo plano
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then(registration => {
          console.log('Service Worker registrado con éxito:', registration.scope);
          
          // Escuchar mensajes del service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data?.type === 'NOTIFICATION_RECEIVED') {
              handleFCMMessage(event.data.payload);
            } else if (event.data?.type === 'NOTIFICATION_CLICKED') {
              // Cuando se hace clic en una notificación en segundo plano
              console.log('Notificación clickeada en segundo plano:', event.data.payload);
              
              // Refrescar las notificaciones cuando se hace clic en una notificación
              if (isAuthenticated && user) {
                loadUserNotifications(user.uid);
              }
              
              // Si la notificación tiene un ID, marcarla como leída
              if (event.data.payload?.notificationId) {
                markNotificationAsRead(event.data.payload.notificationId);
              }
            }
          });
          
          // Verificar si hay mensajes pendientes en el service worker
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'CHECK_PENDING_NOTIFICATIONS'
            });
          }
        })
        .catch(error => {
          console.error('Error al registrar el Service Worker:', error);
        });
    }
  }, [handleFCMMessage, isAuthenticated, user, markNotificationAsRead]);
  
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markNotificationAsRead,
        clearAllNotifications,
        showNotifications,
        toggleNotifications,
        fcmToken,
        notificationsEnabled,
        requestNotificationPermission,
        deviceId,
        markAllNotificationsAsRead,
        loadMoreNotifications,
        isLoading,
        hasMoreNotifications,
        error
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification debe ser usado dentro de un NotificationProvider');
  }
  return context;
};