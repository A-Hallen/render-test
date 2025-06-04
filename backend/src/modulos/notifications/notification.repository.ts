import * as admin from 'firebase-admin';
import { FCMToken, StoredNotification, NotificationFilters, NotificationPayload } from './interfaces/notification.interface';

export class NotificationRepository {
  private db: FirebaseFirestore.Firestore;
  private fcmTokensCollection = 'fcm_tokens';
  private notificationsCollection = 'notifications';

  constructor() {
    this.db = admin.firestore();
  }

  /**
   * Guarda un token FCM para un usuario autenticado
   * @param userId ID del usuario
   * @param token Token FCM
   * @param deviceId ID único del dispositivo
   * @returns El token guardado
   */
  async saveUserToken(userId: string, token: string, deviceId: string): Promise<FCMToken> {
    try {
      // Verificar si ya existe un token para este dispositivo y usuario
      const existingTokenQuery = await this.db.collection(this.fcmTokensCollection)
        .where('userId', '==', userId)
        .where('deviceId', '==', deviceId)
        .limit(1)
        .get();

      const tokenData: FCMToken = {
        token,
        deviceId,
        userId,
        createdAt: new Date(),
        lastUsedAt: new Date(),
        platform: this.detectPlatform()
      };

      // Si existe, actualizar el token
      if (!existingTokenQuery.empty) {
        const docId = existingTokenQuery.docs[0].id;
        await this.db.collection(this.fcmTokensCollection).doc(docId).update({
          token,
          lastUsedAt: new Date()
        });
        return { ...tokenData, ...existingTokenQuery.docs[0].data() } as FCMToken;
      }

      // Si no existe, crear uno nuevo
      const docRef = await this.db.collection(this.fcmTokensCollection).add(tokenData);
      return { ...tokenData, id: docRef.id } as FCMToken & { id: string };
    } catch (error) {
      console.error('Error al guardar token FCM para usuario:', error);
      throw error;
    }
  }

  /**
   * Guarda un token FCM para un dispositivo anónimo (sin usuario autenticado)
   * @param token Token FCM
   * @param deviceId ID único del dispositivo
   * @returns El token guardado
   */
  async saveAnonymousToken(token: string, deviceId: string): Promise<FCMToken> {
    try {
      // Verificar si ya existe un token para este dispositivo
      const existingTokenQuery = await this.db.collection(this.fcmTokensCollection)
        .where('deviceId', '==', deviceId)
        .where('userId', '==', null)
        .limit(1)
        .get();

      const tokenData: FCMToken = {
        token,
        deviceId,
        createdAt: new Date(),
        lastUsedAt: new Date(),
        platform: this.detectPlatform()
      };

      // Si existe, actualizar el token
      if (!existingTokenQuery.empty) {
        const docId = existingTokenQuery.docs[0].id;
        await this.db.collection(this.fcmTokensCollection).doc(docId).update({
          token,
          lastUsedAt: new Date()
        });
        return { ...tokenData, ...existingTokenQuery.docs[0].data() } as FCMToken;
      }

      // Si no existe, crear uno nuevo
      const docRef = await this.db.collection(this.fcmTokensCollection).add(tokenData);
      return { ...tokenData, id: docRef.id } as FCMToken & { id: string };
    } catch (error) {
      console.error('Error al guardar token FCM anónimo:', error);
      throw error;
    }
  }

  /**
   * Asocia un token anónimo a un usuario cuando este se autentica
   * @param deviceId ID del dispositivo
   * @param userId ID del usuario
   * @returns Verdadero si se actualizó correctamente
   */
  async associateAnonymousTokenToUser(deviceId: string, userId: string): Promise<boolean> {
    try {
      const existingTokenQuery = await this.db.collection(this.fcmTokensCollection)
        .where('deviceId', '==', deviceId)
        .where('userId', '==', null)
        .limit(1)
        .get();

      if (existingTokenQuery.empty) {
        return false;
      }

      const docId = existingTokenQuery.docs[0].id;
      await this.db.collection(this.fcmTokensCollection).doc(docId).update({
        userId,
        lastUsedAt: new Date()
      });

      return true;
    } catch (error) {
      console.error('Error al asociar token anónimo a usuario:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los tokens FCM para un usuario específico
   * @param userId ID del usuario
   * @returns Lista de tokens FCM
   */
  async getUserTokens(userId: string): Promise<FCMToken[]> {
    try {
      const snapshot = await this.db.collection(this.fcmTokensCollection)
        .where('userId', '==', userId)
        .get();

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FCMToken & { id: string }));
    } catch (error) {
      console.error('Error al obtener tokens FCM del usuario:', error);
      throw error;
    }
  }

  /**
   * Elimina un token FCM específico
   * @param tokenId ID del token a eliminar
   */
  async deleteToken(tokenId: string): Promise<void> {
    try {
      await this.db.collection(this.fcmTokensCollection).doc(tokenId).delete();
    } catch (error) {
      console.error('Error al eliminar token FCM:', error);
      throw error;
    }
  }

  /**
   * Detecta la plataforma del cliente basado en el user agent
   * @returns Nombre de la plataforma
   */
  private detectPlatform(): string {
    // En un entorno real, esto usaría req.headers['user-agent']
    // Aquí simplemente devolvemos 'web' como valor predeterminado
    return 'web';
  }

  /**
   * Guarda una notificación en la base de datos
   * @param notification Datos de la notificación
   * @returns La notificación guardada
   */
  async saveNotification(notification: NotificationPayload): Promise<StoredNotification> {
    try {
      if (!notification.userId) {
        throw new Error('Se requiere userId para guardar una notificación');
      }

      const storedNotification: StoredNotification = {
        ...notification,
        userId: notification.userId,
        timestamp: Date.now(),
        read: false
      };

      const docRef = await this.db.collection(this.notificationsCollection).add(storedNotification);
      return { ...storedNotification, id: docRef.id };
    } catch (error) {
      console.error('Error al guardar notificación:', error);
      throw error;
    }
  }

  /**
   * Obtiene las notificaciones de un usuario
   * @param filters Filtros para la consulta
   * @returns Lista de notificaciones
   */
  async getUserNotifications(filters: NotificationFilters): Promise<StoredNotification[]> {
    try {
      if (!filters.userId) {
        throw new Error('Se requiere userId para obtener notificaciones');
      }

      let query = this.db.collection(this.notificationsCollection)
        .where('userId', '==', filters.userId);

      if (filters.read !== undefined) {
        query = query.where('read', '==', filters.read);
      }

      if (filters.startDate) {
        query = query.where('timestamp', '>=', filters.startDate);
      }

      if (filters.endDate) {
        query = query.where('timestamp', '<=', filters.endDate);
      }

      query = query.orderBy('timestamp', 'desc');

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StoredNotification));
    } catch (error) {
      console.error('Error al obtener notificaciones del usuario:', error);
      throw error;
    }
  }

  /**
   * Marca una notificación como leída
   * @param notificationId ID de la notificación
   * @param userId ID del usuario (para verificación)
   * @returns La notificación actualizada
   */
  async markNotificationAsRead(notificationId: string, userId: string): Promise<StoredNotification> {
    try {
      const notificationRef = this.db.collection(this.notificationsCollection).doc(notificationId);
      const notificationDoc = await notificationRef.get();

      if (!notificationDoc.exists) {
        throw new Error('Notificación no encontrada');
      }

      const notificationData = notificationDoc.data() as StoredNotification;

      if (notificationData.userId !== userId) {
        throw new Error('No autorizado para modificar esta notificación');
      }

      const updateData = {
        read: true,
        readAt: Date.now()
      };

      await notificationRef.update(updateData);
      return { ...notificationData, ...updateData, id: notificationId };
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      throw error;
    }
  }

  /**
   * Marca todas las notificaciones de un usuario como leídas
   * @param userId ID del usuario
   * @returns Número de notificaciones actualizadas
   */
  async markAllNotificationsAsRead(userId: string): Promise<number> {
    try {
      const batch = this.db.batch();
      const now = Date.now();

      const snapshot = await this.db.collection(this.notificationsCollection)
        .where('userId', '==', userId)
        .where('read', '==', false)
        .get();

      if (snapshot.empty) {
        return 0;
      }

      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { read: true, readAt: now });
      });

      await batch.commit();
      return snapshot.size;
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      throw error;
    }
  }

  /**
   * Elimina una notificación
   * @param notificationId ID de la notificación
   * @param userId ID del usuario (para verificación)
   * @returns true si se eliminó correctamente
   */
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      const notificationRef = this.db.collection(this.notificationsCollection).doc(notificationId);
      const notificationDoc = await notificationRef.get();

      if (!notificationDoc.exists) {
        throw new Error('Notificación no encontrada');
      }

      const notificationData = notificationDoc.data() as StoredNotification;

      if (notificationData.userId !== userId) {
        throw new Error('No autorizado para eliminar esta notificación');
      }

      await notificationRef.delete();
      return true;
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      throw error;
    }
  }

  /**
   * Elimina todas las notificaciones de un usuario
   * @param userId ID del usuario
   * @returns Número de notificaciones eliminadas
   */
  async deleteAllUserNotifications(userId: string): Promise<number> {
    try {
      const batch = this.db.batch();
      const snapshot = await this.db.collection(this.notificationsCollection)
        .where('userId', '==', userId)
        .get();

      if (snapshot.empty) {
        return 0;
      }

      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      return snapshot.size;
    } catch (error) {
      console.error('Error al eliminar todas las notificaciones del usuario:', error);
      throw error;
    }
  }
}
