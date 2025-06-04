/**
 * Servicio para interactuar con el API de notificaciones
 */

import { NotificationPayload, NotificationResult } from "../types/notification";



export class NotificationService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = '/api/notifications';
  }

  /**
   * Envía una notificación a un usuario específico
   * @param userId ID del usuario
   * @param notification Datos de la notificación
   * @returns Respuesta del servidor
   */
  async sendToUser(userId: string, notification: NotificationPayload): Promise<NotificationResult> {
    try {
      const response = await fetch(`${this.apiUrl}/users/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fincoopToken')}`
        },
        body: JSON.stringify(notification)
      });

      if (!response.ok) {
        throw new Error(`Error al enviar notificación: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en servicio de notificaciones:', error);
      throw error;
    }
  }

  /**
   * Envía una notificación a múltiples usuarios
   * @param userIds Lista de IDs de usuarios
   * @param notification Datos de la notificación
   * @returns Respuesta del servidor
   */
  async sendToMultipleUsers(userIds: string[], notification: NotificationPayload): Promise<NotificationResult> {
    try {
      const response = await fetch(`${this.apiUrl}/multi-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fincoopToken')}`
        },
        body: JSON.stringify({ userIds, notification })
      });

      if (!response.ok) {
        throw new Error(`Error al enviar notificaciones: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en servicio de notificaciones:', error);
      throw error;
    }
  }

  /**
   * Envía una notificación a un tema (topic)
   * @param topic Nombre del tema
   * @param notification Datos de la notificación
   * @returns Respuesta del servidor
   */
  async sendToTopic(topic: string, notification: NotificationPayload): Promise<NotificationResult> {
    try {
      const response = await fetch(`${this.apiUrl}/topics/${topic}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fincoopToken')}`
        },
        body: JSON.stringify(notification)
      });

      if (!response.ok) {
        throw new Error(`Error al enviar notificación al tema: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en servicio de notificaciones:', error);
      throw error;
    }
  }

  /**
   * Envía una notificación directamente a un token FCM
   * @param token Token FCM del dispositivo
   * @param notification Datos de la notificación
   * @returns Respuesta del servidor
   */
  async sendToToken(token: string, notification: NotificationPayload): Promise<NotificationResult> {
    try {
      const response = await fetch(`${this.apiUrl}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fincoopToken')}`
        },
        body: JSON.stringify({ token, notification })
      });

      if (!response.ok) {
        throw new Error(`Error al enviar notificación al token: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en servicio de notificaciones:', error);
      throw error;
    }
  }

  /**
   * Prueba el envío de una notificación usando un token FCM específico
   * @param token Token FCM
   * @returns Respuesta del servidor
   */
  async testNotification(token: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        throw new Error(`Error al enviar notificación de prueba: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en servicio de notificaciones:', error);
      throw error;
    }
  }
}

export default new NotificationService();
