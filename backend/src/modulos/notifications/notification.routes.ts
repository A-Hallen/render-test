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
  }

  public getRouter(): Router {
    return this.router;
  }
}
