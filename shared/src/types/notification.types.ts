/**
 * Tipos compartidos para el sistema de notificaciones
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
  userId?: string;
}

/**
 * Notificación con metadatos adicionales
 */
export interface NotificationMeta extends NotificationPayload {
  id: string;
  userId?: string;
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
