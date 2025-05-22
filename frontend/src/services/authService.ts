/**
 * Servicio para manejar las operaciones de autenticación con el backend
 */
export const authService = {
  /**
   * Iniciar sesión de usuario
   * @param email Email del usuario
   * @param password Contraseña del usuario
   * @returns Datos del usuario y token
   * @throws Error con mensaje descriptivo si falla la autenticación
   */
  async login(email: string, password: string) {
    try {
      // Validaciones básicas en el cliente
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Formato de email inválido');
      }

      // Realizar solicitud de autenticación
      const response = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Incluir cookies en la solicitud si es necesario
      });

      // Obtener datos de la respuesta
      const data = await response.json();

      // Manejar respuesta de error
      if (!response.ok) {
        // Usar mensaje del servidor o crear uno genérico
        const errorMessage = data.message || 'Error en la autenticación';
        
        // Crear un error con propiedades adicionales
        const error = new Error(errorMessage) as Error & { code?: string, status?: number };
        error.code = data.code;
        error.status = response.status;
        
        throw error;
      }

      // Verificar que la respuesta contiene los datos esperados
      if (!data.token || !data.user) {
        throw new Error('Respuesta de autenticación inválida');
      }

      return data;
    } catch (error: any) {
      // Registrar el error (sin datos sensibles)
      console.error('Error en login:', {
        message: error.message,
        code: error.code,
        status: error.status
      });
      
      // Re-lanzar el error para que lo maneje el componente
      throw error;
    }
  },

  /**
   * Registrar un nuevo usuario
   * @param userData Datos del nuevo usuario
   * @returns Datos del usuario creado
   */
  async register(userData: { email: string; password: string; displayName: string }) {
    try {
      const response = await fetch(`/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el registro');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  },

  /**
   * Obtener el perfil del usuario actual
   * @param token Token JWT del usuario
   * @returns Datos del perfil del usuario
   */
  async getProfile(token: string) {
    try {
      const response = await fetch(`/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener perfil');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      throw error;
    }
  },

  /**
   * Actualizar el perfil del usuario
   * @param token Token JWT del usuario
   * @param userData Datos a actualizar
   * @returns Datos actualizados del usuario
   */
  async updateProfile(token: string, userData: { displayName?: string; photoURL?: string }) {
    try {
      const response = await fetch(`/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar perfil');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  },

  /**
   * Solicitar restablecimiento de contraseña
   * @param email Email del usuario
   * @returns Mensaje de confirmación
   */
  async requestPasswordReset(email: string) {
    try {
      const response = await fetch(`/api/auth/password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al solicitar restablecimiento');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al solicitar restablecimiento:', error);
      throw error;
    }
  },

  /**
   * Enviar correo de verificación de email
   * @param email Email del usuario a verificar
   * @returns Mensaje de confirmación
   */
  async sendEmailVerification(email: string) {
    try {
      const response = await fetch(`/api/auth/send-verification-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar correo de verificación');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al enviar correo de verificación:', error);
      throw error;
    }
  },

  /**
   * Verificar email con código de verificación
   * @param oobCode Código de verificación recibido por email
   * @returns Resultado de la verificación
   */
  async verifyEmail(oobCode: string) {
    try {
      const response = await fetch(`/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oobCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al verificar email');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al verificar email:', error);
      throw error;
    }
  },
};
