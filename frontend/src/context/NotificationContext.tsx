import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, onMessage, isSupported } from 'firebase/messaging';
import { messaging, vapidKey } from '../firebase/firebaseConfig';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
// @ts-ignore - Ignorar error de tipos para uuid
import { v4 as uuidv4 } from 'uuid';
import type { Notification, NotificationPayload } from '../types/notification';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: NotificationPayload) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  showNotifications: boolean;
  toggleNotifications: (state: boolean) => void;
  fcmToken: string | null;
  notificationsEnabled: boolean;
  requestNotificationPermission: () => Promise<boolean>;
  deviceId: string | null;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Obtener el usuario actual y estado de autenticación
  const { user, isAuthenticated } = useAuth();
  // Estado para las notificaciones
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  
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
  
  // Función para enviar el token FCM al backend
  const sendTokenToBackend = async (token: string, userId?: string) => {
    try {
      // Si no hay deviceId, no podemos continuar
      if (!deviceId) {
        console.warn('No hay ID de dispositivo disponible');
        return;
      }
      
      // Construir la URL de la API
      const apiUrl = '/api/notifications';
      
      // Endpoint diferente según si el usuario está autenticado o no
      let endpoint;
      let body;
      
      if (userId) {
        // Usuario autenticado: asociar token con el usuario
        endpoint = `${apiUrl}/users/${userId}/fcm-tokens`;
        body = JSON.stringify({ token, deviceId });
      } else {
        // Usuario no autenticado: almacenar token con deviceId solamente
        endpoint = `${apiUrl}/anonymous-tokens`;
        body = JSON.stringify({ token, deviceId });
      }
      
      // Enviar el token al backend
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Añadir token de autenticación si está disponible
          ...(localStorage.getItem('fincoopToken') ? {
            'Authorization': `Bearer ${localStorage.getItem('fincoopToken')}`
          } : {}),
        },
        body,
      });
      
      if (!response.ok) {
        throw new Error(`Error al enviar el token FCM: ${response.statusText}`);
      }
      
      console.log('Token FCM enviado correctamente al backend');
    } catch (error) {
      console.error('Error al enviar el token FCM al backend:', error);
      // No mostramos error al usuario ya que esto es un proceso en segundo plano
    }
  };
  
  // Función para solicitar permiso para notificaciones y obtener el token FCM
  const requestNotificationPermission = async (): Promise<boolean> => {
    try {
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
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false,
    };
    
    // Añadir a la lista de notificaciones
    setNotifications(prev => [newNotification, ...prev]);
    
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
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };
  
  // Limpiar todas las notificaciones
  const clearAllNotifications = () => {
    setNotifications([]);
  };
  
  // Mostrar/ocultar el centro de notificaciones
  const toggleNotifications = (state: boolean) => {
    setShowNotifications(state);
  };
  
  // Efecto para recuperar el token FCM del localStorage al cargar
  useEffect(() => {
    //TODO(Eliminar esta linea, esto es solo para pruebas):
    localStorage.setItem('fcmToken', '')
    const savedToken = localStorage.getItem('fcmToken');
    if (savedToken) {
      setFcmToken(savedToken);
      setNotificationsEnabled(false);
    }
  }, []);
  
  // Efecto para enviar el token al backend cuando el usuario se autentica
  useEffect(() => {
    // Si el usuario se acaba de autenticar y ya tenemos un token FCM
    if (isAuthenticated && user && fcmToken && deviceId) {
      // Asociar el token existente con la cuenta de usuario
      sendTokenToBackend(fcmToken, user.uid);
    }
  }, [isAuthenticated, user, fcmToken, deviceId]);
  
  // Configurar el listener de mensajes FCM cuando el componente se monta
  useEffect(() => {
    if (!messaging) return;
    
    // Configurar el listener para mensajes en primer plano
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Mensaje recibido en primer plano:', payload);
      
      // Extraer datos de la notificación
      const { notification, data } = payload;
      
      if (notification) {
        // Crear una notificación en el sistema
        addNotification({
          title: notification.title || 'Nueva notificación',
          body: notification.body || '',
          type: (data?.type as any) || 'info',
          data: data || {}
        });
      }
    });
    
    // Limpiar el listener cuando el componente se desmonta
    return () => {
      unsubscribe();
    };
  }, [messaging]);
  
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markNotificationAsRead,
        clearAllNotifications,
        showNotifications,
        toggleNotifications,
        fcmToken,
        notificationsEnabled,
        requestNotificationPermission,
        deviceId
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