/**
 * Tipos para el sistema de notificaciones
 */

/**
 * Payload de notificación
 */
export interface NotificationPayload {
  title: string;
  body: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  data?: {
    url?: string;
    [key: string]: any;
  };
  imageUrl?: string;
}

/**
 * Notificación con metadatos adicionales
 */
export interface Notification extends NotificationPayload {
  id: string;
  timestamp: number;
  read: boolean;
}

/**
 * Resultado del envío de notificación
 */
export interface NotificationResult {
  success: boolean;
  messageId?: string;
  failureCount?: number;
  successCount?: number;
  invalidTokens?: string[];
  message?: string;
}
