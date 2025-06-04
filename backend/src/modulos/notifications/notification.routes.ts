import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { AuthMiddleware } from '../auth/auth.middleware';

export class NotificationRoutes {
  private router: Router;
  private notificationController: NotificationController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.notificationController = new NotificationController();
    this.authMiddleware = new AuthMiddleware();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Rutas para tokens FCM
    this.router.post(
      '/users/:userId/fcm-tokens',
      this.authMiddleware.verifyToken,
      this.notificationController.saveUserToken.bind(this.notificationController)
    );

    this.router.post(
      '/anonymous-tokens',
      this.notificationController.saveAnonymousToken.bind(this.notificationController)
    );

    // Rutas para envío de notificaciones
    this.router.post(
      '/users/:userId',
      this.authMiddleware.verifyToken,
      this.notificationController.sendNotificationToUser.bind(this.notificationController)
    );

    this.router.post(
      '/multi-user',
      this.authMiddleware.verifyToken,
      this.notificationController.sendNotificationToMultipleUsers.bind(this.notificationController)
    );

    this.router.post(
      '/topics/:topic',
      this.authMiddleware.verifyToken,
      this.notificationController.sendNotificationToTopic.bind(this.notificationController)
    );

    // Ruta para pruebas de notificaciones
    this.router.post(
      '/test',
      this.notificationController.testNotification.bind(this.notificationController)
    );

    // Rutas para la persistencia de notificaciones
    this.router.get(
      '/users/:userId/notifications',
      this.authMiddleware.verifyToken,
      this.notificationController.getUserNotifications.bind(this.notificationController)
    );

    this.router.patch(
      '/users/:userId/notifications/:notificationId/read',
      this.authMiddleware.verifyToken,
      this.notificationController.markNotificationAsRead.bind(this.notificationController)
    );

    this.router.patch(
      '/users/:userId/notifications/read-all',
      this.authMiddleware.verifyToken,
      this.notificationController.markAllNotificationsAsRead.bind(this.notificationController)
    );

    this.router.delete(
      '/users/:userId/notifications/:notificationId',
      this.authMiddleware.verifyToken,
      this.notificationController.deleteNotification.bind(this.notificationController)
    );

    this.router.delete(
      '/users/:userId/notifications',
      this.authMiddleware.verifyToken,
      this.notificationController.deleteAllUserNotifications.bind(this.notificationController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
