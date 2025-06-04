/**
 * Interfaces para el módulo de notificaciones
 */

export interface FCMToken {
  token: string;
  deviceId: string;
  createdAt: Date;
  lastUsedAt: Date;
  platform?: string;
  userId?: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  data?: Record<string, string>;
  imageUrl?: string;
  userId?: string;
}

export interface SendNotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  tokensCount?: number;
  failedTokens?: string[];
}

/**
 * Notificación persistente con metadatos adicionales
 */
export interface StoredNotification extends NotificationPayload {
  id?: string;
  timestamp: number;
  read: boolean;
  readAt?: number;
  userId: string;
}

/**
 * Filtros para consultar notificaciones
 */
export interface NotificationFilters {
  userId?: string;
  read?: boolean;
  startDate?: number;
  endDate?: number;
  limit?: number;
}
