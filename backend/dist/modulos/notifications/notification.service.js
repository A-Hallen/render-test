"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const admin = __importStar(require("firebase-admin"));
const notification_repository_1 = require("./notification.repository");
class NotificationService {
    constructor() {
        this.notificationRepository = new notification_repository_1.NotificationRepository();
        this.messaging = admin.messaging();
    }
    /**
     * Guarda un token FCM para un usuario autenticado
     */
    async saveUserToken(userId, token, deviceId) {
        try {
            return await this.notificationRepository.saveUserToken(userId, token, deviceId);
        }
        catch (error) {
            console.error('Error en servicio al guardar token de usuario:', error);
            throw error;
        }
    }
    /**
     * Guarda un token FCM para un dispositivo anónimo
     */
    async saveAnonymousToken(token, deviceId) {
        try {
            return await this.notificationRepository.saveAnonymousToken(token, deviceId);
        }
        catch (error) {
            console.error('Error en servicio al guardar token anónimo:', error);
            throw error;
        }
    }
    /**
     * Asocia un token anónimo a un usuario cuando este se autentica
     */
    async associateAnonymousTokenToUser(deviceId, userId) {
        try {
            return await this.notificationRepository.associateAnonymousTokenToUser(deviceId, userId);
        }
        catch (error) {
            console.error('Error en servicio al asociar token anónimo a usuario:', error);
            throw error;
        }
    }
    /**
     * Envía una notificación a un usuario específico y la guarda en la base de datos
     * @param userId ID del usuario
     * @param notification Datos de la notificación
     * @returns Resultado del envío
     */
    async sendNotificationToUser(userId, notification) {
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
            // Configurar el mensaje - usando SOLO data para evitar duplicados
            // FCM envía duplicados cuando se usan tanto notification como data
            const message = {
                tokens,
                data: {
                    title: notification.title,
                    body: notification.body,
                    ...notification.data,
                    type: notification.type || 'info',
                    // Convertir timestamp a string para evitar errores
                    timestamp: Date.now().toString(),
                    // Incluir un ID único para la notificación
                    notificationId: `${notification.type || 'info'}-${Date.now()}`
                },
                // Usar solo fcmOptions sin notification para evitar duplicados
                webpush: {
                    fcmOptions: {
                        link: '/'
                    },
                    // Incluir headers para mejorar la entrega
                    headers: {
                        Urgency: 'high'
                    }
                }
            };
            // Añadir imageUrl a data si existe
            if (notification.imageUrl && notification.imageUrl.trim() !== '' && message.data) {
                message.data.imageUrl = notification.imageUrl;
            }
            // Añadir icon y badge a data para que el service worker los use
            if (message.data) {
                message.data.icon = '/logo192.png';
                message.data.badge = '/badge.png';
            }
            // Guardar la notificación en la base de datos
            const notificationWithUserId = {
                ...notification,
                userId
            };
            await this.notificationRepository.saveNotification(notificationWithUserId);
            // Enviar la notificación
            const response = await this.messaging.sendEachForMulticast(message);
            // Manejar tokens fallidos
            if (response.failureCount > 0) {
                const failedTokens = [];
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
        }
        catch (error) {
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
    async sendNotificationToMultipleUsers(userIds, notification) {
        try {
            const results = await Promise.all(userIds.map(userId => this.sendNotificationToUser(userId, notification)));
            const successCount = results.filter(r => r.success).length;
            return {
                success: successCount > 0,
                tokensCount: results.reduce((acc, r) => acc + (r.tokensCount || 0), 0),
                failedTokens: results.flatMap(r => r.failedTokens || [])
            };
        }
        catch (error) {
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
    async sendNotificationToTopic(topic, notification) {
        try {
            // Configurar el mensaje
            const message = {
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
        }
        catch (error) {
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
    async handleFailedTokens(userTokens, failedTokens) {
        try {
            const tokensToDelete = userTokens
                .filter(t => failedTokens.includes(t.token))
                .filter(t => t.id) // Solo los que tienen ID
                .map(t => t.id);
            // Eliminar tokens inválidos
            await Promise.all(tokensToDelete.map(id => this.notificationRepository.deleteToken(id)));
        }
        catch (error) {
            console.error('Error al manejar tokens fallidos:', error);
        }
    }
    /**
     * Obtiene las notificaciones de un usuario
     * @param userId ID del usuario
     * @param filters Filtros opcionales
     * @returns Lista de notificaciones
     */
    async getUserNotifications(userId, filters = {}) {
        try {
            const notificationFilters = {
                userId,
                ...filters
            };
            return await this.notificationRepository.getUserNotifications(notificationFilters);
        }
        catch (error) {
            console.error('Error en servicio al obtener notificaciones del usuario:', error);
            throw error;
        }
    }
    /**
     * Marca una notificación como leída
     * @param notificationId ID de la notificación
     * @param userId ID del usuario
     * @returns La notificación actualizada
     */
    async markNotificationAsRead(notificationId, userId) {
        try {
            return await this.notificationRepository.markNotificationAsRead(notificationId, userId);
        }
        catch (error) {
            console.error('Error en servicio al marcar notificación como leída:', error);
            throw error;
        }
    }
    /**
     * Marca todas las notificaciones de un usuario como leídas
     * @param userId ID del usuario
     * @returns Número de notificaciones actualizadas
     */
    async markAllNotificationsAsRead(userId) {
        try {
            return await this.notificationRepository.markAllNotificationsAsRead(userId);
        }
        catch (error) {
            console.error('Error en servicio al marcar todas las notificaciones como leídas:', error);
            throw error;
        }
    }
    /**
     * Elimina una notificación
     * @param notificationId ID de la notificación
     * @param userId ID del usuario
     * @returns true si se eliminó correctamente
     */
    async deleteNotification(notificationId, userId) {
        try {
            return await this.notificationRepository.deleteNotification(notificationId, userId);
        }
        catch (error) {
            console.error('Error en servicio al eliminar notificación:', error);
            throw error;
        }
    }
    /**
     * Elimina todas las notificaciones de un usuario
     * @param userId ID del usuario
     * @returns Número de notificaciones eliminadas
     */
    async deleteAllUserNotifications(userId) {
        try {
            return await this.notificationRepository.deleteAllUserNotifications(userId);
        }
        catch (error) {
            console.error('Error en servicio al eliminar todas las notificaciones del usuario:', error);
            throw error;
        }
    }
}
exports.NotificationService = NotificationService;
