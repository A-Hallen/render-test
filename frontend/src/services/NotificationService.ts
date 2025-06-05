/**
 * Servicio para interactuar con el API de notificaciones
 * Enfocado en la gestión de notificaciones (obtener, marcar como leídas, eliminar)
 */

import { NotificationMeta } from "../types/notification";
import { httpClient } from "./httpClient";

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
      const data = { token, deviceId };
      
      if (userId) {
        // Usuario autenticado: asociar token con el usuario
        endpoint = `/api/notifications/users/${userId}/fcm-tokens`;
      } else {
        // Usuario no autenticado: almacenar token con deviceId solamente
        endpoint = `/api/notifications/anonymous-tokens`;
      }
      
      // Usar el cliente HTTP centralizado
      return await httpClient.post(endpoint, data);
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
      // Usar el cliente HTTP centralizado con parámetros de consulta
      return await httpClient.get(
        `${this.apiUrl}/users/${userId}/notifications`,
        {},
        filters
      );
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
      return await httpClient.patch(`${this.apiUrl}/users/${userId}/notifications/${notificationId}/read`, {});
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
      return await httpClient.patch(`${this.apiUrl}/users/${userId}/notifications/read-all`, {});
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
      return await httpClient.delete(`${this.apiUrl}/users/${userId}/notifications/${notificationId}`);
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
      return await httpClient.delete(`${this.apiUrl}/users/${userId}/notifications`);
    } catch (error) {
      console.error('Error al eliminar todas las notificaciones:', error);
      throw error;
    }
  }
}

// Crear una instancia única del servicio
const notificationService = new NotificationService();
export default notificationService;
