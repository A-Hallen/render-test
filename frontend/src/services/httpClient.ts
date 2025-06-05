/**
 * Cliente HTTP centralizado con manejo de tokens y errores
 * Implementa el patrón de interceptor para manejar automáticamente
 * casos como tokens vencidos, errores de red, etc.
 */

import { AuthResponse } from "../types/auth";

// Constantes para mensajes de error
const ERROR_MESSAGES = {
  UNAUTHORIZED: "Sesión expirada. Por favor inicie sesión nuevamente.",
  FORBIDDEN: "No tiene permisos para realizar esta acción.",
  SERVER_ERROR: "Error en el servidor. Intente más tarde.",
  NETWORK_ERROR: "Error de conexión. Verifique su conexión a internet.",
  DEFAULT: "Ha ocurrido un error inesperado."
};

// Evento personalizado para notificar cuando un token ha expirado
export const SESSION_EXPIRED_EVENT = "session_expired";

// Interfaz para opciones extendidas de fetch
interface ExtendedRequestInit extends RequestInit {
  skipAuthRefresh?: boolean; // Para evitar bucles infinitos en el refresh de token
}

/**
 * Cliente HTTP con interceptores para manejo automático de errores
 * y tokens de autenticación
 */
class HttpClient {
  // Flag para evitar múltiples intentos simultáneos de renovación de token
  private isRefreshing = false;
  // Cola de solicitudes pendientes durante la renovación del token
  private refreshQueue: Array<() => void> = [];

  /**
   * Realiza una solicitud HTTP con manejo automático de tokens y errores
   * @param url URL de la solicitud
   * @param options Opciones de fetch
   * @returns Respuesta procesada
   */
  async fetch(url: string, options: ExtendedRequestInit = {}): Promise<any> {
    try {
      // Obtener token del localStorage
      const token = localStorage.getItem("fincoopToken");

      // Configurar headers con autenticación si hay token
      const headers: any = {
        ...options.headers,
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Realizar la solicitud
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Manejar respuesta según el código de estado
      if (response.ok) {
        // Para respuestas exitosas, intentar parsear como JSON
        // Si falla, devolver el texto plano
        try {
          return await response.json();
        } catch (e) {
          return await response.text();
        }
      } else if (response.status === 401) {
        // Token expirado o inválido

        // Si la opción skipAuthRefresh está activada, no intentar renovar el token
        // Esto es para evitar bucles infinitos en el endpoint de refresh token
        if (options.skipAuthRefresh) {
          this.handleUnauthorized();
          throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
        }

        // Intentar renovar el token y reintentar la solicitud original
        return this.handleTokenRefresh(url, options);
      } else if (response.status === 403) {
        throw new Error(ERROR_MESSAGES.FORBIDDEN);
      } else if (response.status >= 500) {
        throw new Error(ERROR_MESSAGES.SERVER_ERROR);
      } else {
        // Intentar obtener detalles del error desde la respuesta
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || ERROR_MESSAGES.DEFAULT);
        } catch (e) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      }
    } catch (error: any) {
      // Manejar errores de red
      if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }

      // Re-lanzar otros errores
      throw error;
    }
  }

  /**
   * Maneja la renovación del token y reintenta la solicitud original
   * @param url URL de la solicitud original
   * @param options Opciones de la solicitud original
   * @returns Resultado de la solicitud original con el token renovado
   */
  private async handleTokenRefresh(url: string, options: ExtendedRequestInit): Promise<any> {
    // Si ya estamos renovando el token, agregar esta solicitud a la cola
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshQueue.push(() => {
          resolve(this.fetch(url, options));
        });
      });
    }

    this.isRefreshing = true;

    try {
      // Intentar renovar el token
      const refreshToken = localStorage.getItem("fincoopRefreshToken");

      if (!refreshToken) {
        // No hay refresh token disponible, manejar como sesión expirada
        this.handleUnauthorized();
        throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      }

      // Llamar al endpoint de refresh token
      const response = await fetch("/api/auth/refresh-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        // Falló la renovación del token
        this.handleUnauthorized();
        throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      }

      const data = await response.json();

      if (!data.token) {
        // Respuesta inválida
        this.handleUnauthorized();
        throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      }

      // Guardar el nuevo token
      localStorage.setItem("fincoopToken", data.token);

      // Actualizar el refresh token si se recibe uno nuevo
      if (data.refreshToken) {
        localStorage.setItem("fincoopRefreshToken", data.refreshToken);
      }

      // Procesar la cola de solicitudes pendientes
      this.refreshQueue.forEach(callback => callback());
      this.refreshQueue = [];

      // Reintentar la solicitud original con el nuevo token
      return this.fetch(url, options);
    } catch (error) {
      // Propagar el error
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Maneja el caso de token expirado o inválido
   */
  private handleUnauthorized(): void {
    // Limpiar datos de autenticación
    localStorage.removeItem("fincoopToken");
    localStorage.removeItem("fincoopRefreshToken");
    localStorage.removeItem("fincoopUser");
    
    // Emitir evento para que los componentes puedan reaccionar
    const event = new CustomEvent(SESSION_EXPIRED_EVENT);
    window.dispatchEvent(event);
  }
  
  /**
   * Método GET
   * @param url URL base de la solicitud
   * @param options Opciones adicionales
   * @param queryParams Parámetros de consulta (opcional)
   * @returns Respuesta procesada
   */
  async get(url: string, options: RequestInit = {}, queryParams?: Record<string, any>): Promise<any> {
    // Construir URL con parámetros de consulta si existen
    let fullUrl = url;
    
    if (queryParams && Object.keys(queryParams).length > 0) {
      const params = new URLSearchParams();
      
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof Date) {
            params.append(key, value.toISOString());
          } else {
            params.append(key, String(value));
          }
        }
      });
      
      // Agregar parámetros a la URL
      const queryString = params.toString();
      if (queryString) {
        fullUrl = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
      }
    }
    
    return this.fetch(fullUrl, { ...options, method: "GET" });
  }
  
  /**
   * Método POST
   */
  async post(url: string, data: any, options: RequestInit = {}): Promise<any> {
    return this.fetch(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  
  /**
   * Método PUT
   */
  async put(url: string, data: any, options: RequestInit = {}): Promise<any> {
    return this.fetch(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  
  /**
   * Método DELETE
   */
  async delete(url: string, options: RequestInit = {}): Promise<any> {
    return this.fetch(url, { ...options, method: "DELETE" });
  }
  
  /**
   * Método PATCH
   * @param url URL de la solicitud
   * @param data Datos a enviar en el cuerpo de la solicitud
   * @param options Opciones adicionales
   * @returns Respuesta procesada
   */
  async patch(url: string, data: any, options: RequestInit = {}): Promise<any> {
    return this.fetch(url, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
  
  /**
   * Método para subir archivos
   * @param url URL de la solicitud
   * @param formData FormData con los archivos y datos a enviar
   * @returns Respuesta procesada
   */
  async upload(url: string, formData: FormData): Promise<any> {
    try {
      // Obtener token del localStorage
      const token = localStorage.getItem("fincoopToken");
      
      // Configurar headers para la autenticación
      const headers: HeadersInit = {};
      
      // Agregar token de autorización si existe
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      // Realizar la solicitud con fetch nativo
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
      });
      
      // Manejar respuesta según el código de estado
      if (response.ok) {
        // Para respuestas exitosas, intentar parsear como JSON
        try {
          return await response.json();
        } catch (e) {
          return await response.text();
        }
      }
      
      // Manejar errores según el código de estado
      if (response.status === 401) {
        // Token expirado o inválido
        this.handleUnauthorized();
        throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      }
      
      if (response.status === 403) {
        throw new Error(ERROR_MESSAGES.FORBIDDEN);
      }
      
      if (response.status >= 500) {
        throw new Error(ERROR_MESSAGES.SERVER_ERROR);
      }
      
      // Intentar obtener detalles del error desde la respuesta
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || ERROR_MESSAGES.DEFAULT);
      } catch (e) {
        // Si no se puede parsear la respuesta, usar mensaje genérico
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      // Manejar errores de red
      if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }
      
      // Re-lanzar otros errores
      throw error;
    }
  }
}

// Exportar una instancia única (singleton)
export const httpClient = new HttpClient();
