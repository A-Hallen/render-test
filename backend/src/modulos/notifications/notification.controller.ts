import { Request, Response } from 'express';
import { NotificationService } from './notification.service';
import { NotificationPayload, NotificationFilters } from './interfaces/notification.interface';
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

  /**
   * Obtiene las notificaciones de un usuario
   */
  async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { read, startDate, endDate, limit } = req.query;

      // Verificar que el usuario autenticado solo pueda ver sus propias notificaciones
      if (req.user && req.user.uid !== userId && req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ message: 'No autorizado para ver notificaciones de otro usuario' });
        return;
      }

      // Preparar filtros
      const filters: NotificationFilters = { userId };
      
      if (read !== undefined) {
        filters.read = read === 'true';
      }
      
      if (startDate) {
        filters.startDate = Number(startDate);
      }
      
      if (endDate) {
        filters.endDate = Number(endDate);
      }
      
      if (limit) {
        filters.limit = Number(limit);
      }

      const notifications = await this.notificationService.getUserNotifications(userId, filters);
      res.status(200).json(notifications);
    } catch (error: any) {
      console.error('Error al obtener notificaciones del usuario:', error);
      res.status(500).json({
        message: error.message || 'Error al obtener notificaciones',
        code: error.code
      });
    }
  }

  /**
   * Marca una notificación como leída
   */
  async markNotificationAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { userId, notificationId } = req.params;

      // Verificar que el usuario autenticado solo pueda modificar sus propias notificaciones
      if (req.user && req.user.uid !== userId && req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ message: 'No autorizado para modificar notificaciones de otro usuario' });
        return;
      }

      const notification = await this.notificationService.markNotificationAsRead(notificationId, userId);
      res.status(200).json(notification);
    } catch (error: any) {
      console.error('Error al marcar notificación como leída:', error);
      res.status(error.message.includes('No autorizado') ? 403 : 500).json({
        message: error.message || 'Error al marcar notificación como leída',
        code: error.code
      });
    }
  }

  /**
   * Marca todas las notificaciones de un usuario como leídas
   */
  async markAllNotificationsAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      // Verificar que el usuario autenticado solo pueda modificar sus propias notificaciones
      if (req.user && req.user.uid !== userId && req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ message: 'No autorizado para modificar notificaciones de otro usuario' });
        return;
      }

      const count = await this.notificationService.markAllNotificationsAsRead(userId);
      res.status(200).json({ count });
    } catch (error: any) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      res.status(500).json({
        message: error.message || 'Error al marcar todas las notificaciones como leídas',
        code: error.code
      });
    }
  }

  /**
   * Elimina una notificación
   */
  async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const { userId, notificationId } = req.params;

      // Verificar que el usuario autenticado solo pueda eliminar sus propias notificaciones
      if (req.user && req.user.uid !== userId && req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ message: 'No autorizado para eliminar notificaciones de otro usuario' });
        return;
      }

      const success = await this.notificationService.deleteNotification(notificationId, userId);
      res.status(success ? 200 : 404).json({ success });
    } catch (error: any) {
      console.error('Error al eliminar notificación:', error);
      res.status(error.message.includes('No autorizado') ? 403 : 500).json({
        message: error.message || 'Error al eliminar notificación',
        code: error.code
      });
    }
  }

  /**
   * Elimina todas las notificaciones de un usuario
   */
  async deleteAllUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      // Verificar que el usuario autenticado solo pueda eliminar sus propias notificaciones
      if (req.user && req.user.uid !== userId && req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ message: 'No autorizado para eliminar notificaciones de otro usuario' });
        return;
      }

      const count = await this.notificationService.deleteAllUserNotifications(userId);
      res.status(200).json({ count });
    } catch (error: any) {
      console.error('Error al eliminar todas las notificaciones del usuario:', error);
      res.status(500).json({
        message: error.message || 'Error al eliminar todas las notificaciones',
        code: error.code
      });
    }
  }
}
