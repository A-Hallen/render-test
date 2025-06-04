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
}

export interface SendNotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  tokensCount?: number;
  failedTokens?: string[];
}
