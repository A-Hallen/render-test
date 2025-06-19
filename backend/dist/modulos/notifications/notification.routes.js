"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRoutes = void 0;
const express_1 = require("express");
const notification_controller_1 = require("./notification.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
class NotificationRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.notificationController = new notification_controller_1.NotificationController();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.setupRoutes();
    }
    setupRoutes() {
        // Rutas para tokens FCM
        this.router.post('/users/:userId/fcm-tokens', this.authMiddleware.verifyToken, this.notificationController.saveUserToken.bind(this.notificationController));
        this.router.post('/anonymous-tokens', this.notificationController.saveAnonymousToken.bind(this.notificationController));
        // Rutas para envío de notificaciones
        this.router.post('/users/:userId', this.authMiddleware.verifyToken, this.notificationController.sendNotificationToUser.bind(this.notificationController));
        this.router.post('/multi-user', this.authMiddleware.verifyToken, this.notificationController.sendNotificationToMultipleUsers.bind(this.notificationController));
        this.router.post('/topics/:topic', this.authMiddleware.verifyToken, this.notificationController.sendNotificationToTopic.bind(this.notificationController));
        // Ruta para pruebas de notificaciones
        this.router.post('/test', this.notificationController.testNotification.bind(this.notificationController));
        // Rutas para la persistencia de notificaciones
        this.router.get('/users/:userId/notifications', this.authMiddleware.verifyToken, this.notificationController.getUserNotifications.bind(this.notificationController));
        this.router.patch('/users/:userId/notifications/:notificationId/read', this.authMiddleware.verifyToken, this.notificationController.markNotificationAsRead.bind(this.notificationController));
        this.router.patch('/users/:userId/notifications/read-all', this.authMiddleware.verifyToken, this.notificationController.markAllNotificationsAsRead.bind(this.notificationController));
        this.router.delete('/users/:userId/notifications/:notificationId', this.authMiddleware.verifyToken, this.notificationController.deleteNotification.bind(this.notificationController));
        this.router.delete('/users/:userId/notifications', this.authMiddleware.verifyToken, this.notificationController.deleteAllUserNotifications.bind(this.notificationController));
    }
    getRouter() {
        return this.router;
    }
}
exports.NotificationRoutes = NotificationRoutes;
