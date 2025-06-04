import * as admin from 'firebase-admin';
import { NotificationRepository } from './notification.repository';
import { FCMToken, NotificationPayload, SendNotificationResult } from './interfaces/notification.interface';

export class NotificationService {
  private notificationRepository: NotificationRepository;
  private messaging: admin.messaging.Messaging;

  constructor() {
    this.notificationRepository = new NotificationRepository();
    this.messaging = admin.messaging();
  }

  /**
   * Guarda un token FCM para un usuario autenticado
   */
  async saveUserToken(userId: string, token: string, deviceId: string): Promise<FCMToken> {
    try {
      return await this.notificationRepository.saveUserToken(userId, token, deviceId);
    } catch (error) {
      console.error('Error en servicio al guardar token de usuario:', error);
      throw error;
    }
  }

  /**
   * Guarda un token FCM para un dispositivo anónimo
   */
  async saveAnonymousToken(token: string, deviceId: string): Promise<FCMToken> {
    try {
      return await this.notificationRepository.saveAnonymousToken(token, deviceId);
    } catch (error) {
      console.error('Error en servicio al guardar token anónimo:', error);
      throw error;
    }
  }

  /**
   * Asocia un token anónimo a un usuario cuando este se autentica
   */
  async associateAnonymousTokenToUser(deviceId: string, userId: string): Promise<boolean> {
    try {
      return await this.notificationRepository.associateAnonymousTokenToUser(deviceId, userId);
    } catch (error) {
      console.error('Error en servicio al asociar token anónimo a usuario:', error);
      throw error;
    }
  }

  /**
   * Envía una notificación a un usuario específico
   * @param userId ID del usuario
   * @param notification Datos de la notificación
   * @returns Resultado del envío
   */
  async sendNotificationToUser(userId: string, notification: NotificationPayload): Promise<SendNotificationResult> {
    try {
      // Obtener todos los tokens del usuario
      const userTokens = await this.notificationRepository.getUserTokens(userId);
      
      if (!userTokens.length) {
        return {
          success: false,
          error: 'No se encontraron tokens FCM para el usuario',
          tokensCount: 0
        };
      }

      // Extraer solo los tokens
      const tokens = userTokens.map(t => t.token);

      // Configurar el mensaje
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl
        },
        data: {
          ...notification.data,
          type: notification.type || 'info'
        },
        webpush: {
          notification: {
            icon: '/logo192.png',
            badge: '/badge.png',
            vibrate: [100, 50, 100],
            actions: [
              {
                action: 'open',
                title: 'Ver'
              }
            ]
          },
          fcmOptions: {
            link: '/'
          }
        }
      };

      // Enviar la notificación
      const response = await this.messaging.sendEachForMulticast(message);

      // Manejar tokens fallidos
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
            console.error('Error al enviar notificación:', resp.error);
          }
        });

        // Si hay tokens inválidos, eliminarlos
        if (failedTokens.length > 0) {
          this.handleFailedTokens(userTokens, failedTokens);
        }

        return {
          success: response.successCount > 0,
          messageId: response.responses.find(r => r.success)?.messageId,
          tokensCount: tokens.length,
          failedTokens
        };
      }

      return {
        success: true,
        messageId: response.responses[0].messageId,
        tokensCount: tokens.length
      };
    } catch (error: any) {
      console.error('Error al enviar notificación al usuario:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido al enviar notificación'
      };
    }
  }

  /**
   * Envía una notificación a múltiples usuarios
   * @param userIds Lista de IDs de usuarios
   * @param notification Datos de la notificación
   * @returns Resultado del envío
   */
  async sendNotificationToMultipleUsers(userIds: string[], notification: NotificationPayload): Promise<SendNotificationResult> {
    try {
      const results = await Promise.all(
        userIds.map(userId => this.sendNotificationToUser(userId, notification))
      );

      const successCount = results.filter(r => r.success).length;
      
      return {
        success: successCount > 0,
        tokensCount: results.reduce((acc, r) => acc + (r.tokensCount || 0), 0),
        failedTokens: results.flatMap(r => r.failedTokens || [])
      };
    } catch (error: any) {
      console.error('Error al enviar notificación a múltiples usuarios:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido al enviar notificaciones'
      };
    }
  }

  /**
   * Envía una notificación a todos los usuarios
   * @param notification Datos de la notificación
   * @returns Resultado del envío
   */
  async sendNotificationToTopic(topic: string, notification: NotificationPayload): Promise<SendNotificationResult> {
    try {
      // Configurar el mensaje
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl
        },
        data: {
          ...notification.data,
          type: notification.type || 'info'
        },
        webpush: {
          notification: {
            icon: '/logo192.png',
            badge: '/badge.png',
            vibrate: [100, 50, 100],
            actions: [
              {
                action: 'open',
                title: 'Ver'
              }
            ]
          },
          fcmOptions: {
            link: '/'
          }
        }
      };

      // Enviar la notificación
      const response = await this.messaging.send(message);

      return {
        success: true,
        messageId: response
      };
    } catch (error: any) {
      console.error('Error al enviar notificación a topic:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido al enviar notificación'
      };
    }
  }

  /**
   * Maneja los tokens fallidos, eliminándolos de la base de datos
   * @param userTokens Tokens del usuario
   * @param failedTokens Tokens que fallaron
   */
  private async handleFailedTokens(userTokens: (FCMToken & { id?: string })[], failedTokens: string[]): Promise<void> {
    try {
      const tokensToDelete = userTokens
        .filter(t => failedTokens.includes(t.token))
        .filter(t => t.id) // Solo los que tienen ID
        .map(t => t.id as string);

      // Eliminar tokens inválidos
      await Promise.all(
        tokensToDelete.map(id => this.notificationRepository.deleteToken(id))
      );
    } catch (error) {
      console.error('Error al manejar tokens fallidos:', error);
    }
  }
}
