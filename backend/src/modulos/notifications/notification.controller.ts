import { Request, Response } from 'express';
import { NotificationService } from './notification.service';
import { NotificationPayload } from './interfaces/notification.interface';
import { UserRole } from '../auth/interfaces/user.interface';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Guarda un token FCM para un usuario autenticado
   */
  async saveUserToken(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { token, deviceId } = req.body;

      // Validar datos de entrada
      if (!token || !deviceId) {
        res.status(400).json({ message: 'Se requiere token y deviceId' });
        return;
      }

      // Verificar que el usuario autenticado solo pueda actualizar su propio token
      if (req.user && req.user.uid !== userId) {
        res.status(403).json({ message: 'No autorizado para guardar tokens de otro usuario' });
        return;
      }

      const result = await this.notificationService.saveUserToken(userId, token, deviceId);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error al guardar token FCM de usuario:', error);
      res.status(500).json({
        message: error.message || 'Error al guardar token FCM',
        code: error.code
      });
    }
  }

  /**
   * Guarda un token FCM para un dispositivo anónimo
   */
  async saveAnonymousToken(req: Request, res: Response): Promise<void> {
    try {
      const { token, deviceId } = req.body;

      // Validar datos de entrada
      if (!token || !deviceId) {
        res.status(400).json({ message: 'Se requiere token y deviceId' });
        return;
      }

      const result = await this.notificationService.saveAnonymousToken(token, deviceId);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error al guardar token FCM anónimo:', error);
      res.status(500).json({
        message: error.message || 'Error al guardar token FCM anónimo',
        code: error.code
      });
    }
  }

  /**
   * Envía una notificación a un usuario específico
   */
  async sendNotificationToUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const notification: NotificationPayload = req.body;

      // Validar datos de entrada
      if (!notification.title || !notification.body) {
        res.status(400).json({ message: 'Se requiere título y cuerpo de la notificación' });
        return;
      }

      // Solo administradores pueden enviar notificaciones
      if (req.user && req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ message: 'No autorizado para enviar notificaciones' });
        return;
      }

      const result = await this.notificationService.sendNotificationToUser(userId, notification);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error al enviar notificación al usuario:', error);
      res.status(500).json({
        message: error.message || 'Error al enviar notificación',
        code: error.code
      });
    }
  }

  /**
   * Envía una notificación a múltiples usuarios
   */
  async sendNotificationToMultipleUsers(req: Request, res: Response): Promise<void> {
    try {
      const { userIds } = req.body;
      const notification: NotificationPayload = req.body.notification;

      // Validar datos de entrada
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        res.status(400).json({ message: 'Se requiere una lista de IDs de usuarios' });
        return;
      }

      if (!notification || !notification.title || !notification.body) {
        res.status(400).json({ message: 'Se requiere título y cuerpo de la notificación' });
        return;
      }

      // Solo administradores pueden enviar notificaciones
      if (req.user && req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ message: 'No autorizado para enviar notificaciones' });
        return;
      }

      const result = await this.notificationService.sendNotificationToMultipleUsers(userIds, notification);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error al enviar notificación a múltiples usuarios:', error);
      res.status(500).json({
        message: error.message || 'Error al enviar notificaciones',
        code: error.code
      });
    }
  }

  /**
   * Envía una notificación a un tema (topic)
   */
  async sendNotificationToTopic(req: Request, res: Response): Promise<void> {
    try {
      const { topic } = req.params;
      const notification: NotificationPayload = req.body;

      // Validar datos de entrada
      if (!topic) {
        res.status(400).json({ message: 'Se requiere un tema (topic)' });
        return;
      }

      if (!notification.title || !notification.body) {
        res.status(400).json({ message: 'Se requiere título y cuerpo de la notificación' });
        return;
      }

      // Solo administradores pueden enviar notificaciones
      if (req.user && req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ message: 'No autorizado para enviar notificaciones' });
        return;
      }

      const result = await this.notificationService.sendNotificationToTopic(topic, notification);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error al enviar notificación a topic:', error);
      res.status(500).json({
        message: error.message || 'Error al enviar notificación',
        code: error.code
      });
    }
  }

  /**
   * Prueba de envío de notificación (para desarrollo)
   */
  async testNotification(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      const notification: NotificationPayload = {
        title: 'Notificación de prueba',
        body: 'Esta es una notificación de prueba desde el backend',
        type: 'info',
        data: {
          url: '/notifications-test',
          timestamp: new Date().toISOString()
        }
      };

      // Validar datos de entrada
      if (!token) {
        res.status(400).json({ message: 'Se requiere un token FCM' });
        return;
      }

      // Enviar notificación directamente usando Firebase Admin SDK
      const message = {
        token,
        notification: {
          title: notification.title,
          body: notification.body
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

      const response = await this.notificationService['messaging'].send(message);
      
      res.status(200).json({
        success: true,
        messageId: response
      });
    } catch (error: any) {
      console.error('Error al enviar notificación de prueba:', error);
      res.status(500).json({
        message: error.message || 'Error al enviar notificación de prueba',
        code: error.code
      });
    }
  }
}
