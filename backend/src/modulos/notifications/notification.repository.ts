import * as admin from 'firebase-admin';
import { FCMToken } from './interfaces/notification.interface';

export class NotificationRepository {
  private db: FirebaseFirestore.Firestore;
  private fcmTokensCollection = 'fcm_tokens';

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
}
