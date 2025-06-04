/**
 * Servicio para interactuar con el API de notificaciones
 * Enfocado en la gestión de notificaciones (obtener, marcar como leídas, eliminar)
 */

import { NotificationMeta } from "../types/notification";

export class NotificationService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = '/api/notifications';
  }
  
  /**
   * Registra un token FCM para el usuario actual
   * @param token Token FCM
   * @param userId ID del usuario (opcional)
   * @param deviceId ID del dispositivo
   * @returns Respuesta del servidor
   */
  async registerToken(token: string, userId: string | undefined, deviceId: string): Promise<any> {
    try {
      // Endpoint diferente según si el usuario está autenticado o no
      let endpoint;
      let body;
      
      if (userId) {
        // Usuario autenticado: asociar token con el usuario
        endpoint = `/api/notifications/users/${userId}/fcm-tokens`;
        body = JSON.stringify({ token, deviceId });
      } else {
        // Usuario no autenticado: almacenar token con deviceId solamente
        endpoint = `/api/notifications/anonymous-tokens`;
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
        throw new Error(`Error al registrar token FCM: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al registrar token FCM:', error);
      throw error;
    }
  }

  /**
   * Obtiene las notificaciones del usuario actual
   * @param userId ID del usuario
   * @param filters Filtros opcionales (leídas, rango de fechas, límite)
   * @returns Lista de notificaciones
   */
  async getUserNotifications(userId: string, filters?: { read?: boolean, startDate?: number, endDate?: number, limit?: number }): Promise<NotificationMeta[]> {
    try {
      // Construir query params
      const queryParams = new URLSearchParams();
      if (filters?.read !== undefined) queryParams.append('read', filters.read.toString());
      if (filters?.startDate) queryParams.append('startDate', filters.startDate.toString());
      if (filters?.endDate) queryParams.append('endDate', filters.endDate.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      const response = await fetch(`${this.apiUrl}/users/${userId}/notifications${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fincoopToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error al obtener notificaciones: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      throw error;
    }
  }

  /**
   * Marca una notificación como leída
   * @param userId ID del usuario
   * @param notificationId ID de la notificación
   * @returns La notificación actualizada
   */
  async markNotificationAsRead(userId: string, notificationId: string): Promise<NotificationMeta> {
    try {
      const response = await fetch(`${this.apiUrl}/users/${userId}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fincoopToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error al marcar notificación como leída: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      throw error;
    }
  }

  /**
   * Marca todas las notificaciones del usuario como leídas
   * @param userId ID del usuario
   * @returns Número de notificaciones actualizadas
   */
  async markAllNotificationsAsRead(userId: string): Promise<{ count: number }> {
    try {
      const response = await fetch(`${this.apiUrl}/users/${userId}/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fincoopToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error al marcar todas las notificaciones como leídas: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      throw error;
    }
  }

  /**
   * Elimina una notificación
   * @param userId ID del usuario
   * @param notificationId ID de la notificación
   * @returns true si se eliminó correctamente
   */
  async deleteNotification(userId: string, notificationId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.apiUrl}/users/${userId}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fincoopToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar notificación: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      throw error;
    }
  }

  /**
   * Elimina todas las notificaciones del usuario
   * @param userId ID del usuario
   * @returns Número de notificaciones eliminadas
   */
  async deleteAllNotifications(userId: string): Promise<{ count: number }> {
    try {
      const response = await fetch(`${this.apiUrl}/users/${userId}/notifications`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fincoopToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar todas las notificaciones: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al eliminar todas las notificaciones:', error);
      throw error;
    }
  }
}

// Crear una instancia única del servicio
const notificationService = new NotificationService();
export default notificationService;
