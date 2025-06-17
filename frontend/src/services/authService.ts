import { httpClient } from './httpClient';

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

      // Usar el cliente HTTP para manejar la solicitud
      const data = await httpClient.post('/api/auth/login', { email, password });

      // Verificar que la respuesta contiene los datos esperados
      if (!data.token || !data.user) {
        throw new Error('Respuesta de autenticación inválida');
      }

      // Guardar el refresh token en localStorage si está disponible
      if (data.refreshToken) {
        localStorage.setItem('fincoopRefreshToken', data.refreshToken);
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
   * Renovar token de acceso usando refresh token
   * @returns Nuevo token y refresh token
   * @throws Error si falla la renovación del token
   */
  async refreshToken() {
    try {
      // Obtener refresh token del localStorage
      const refreshToken = localStorage.getItem('fincoopRefreshToken');
      
      if (!refreshToken) {
        throw new Error('No hay refresh token disponible');
      }

      // Llamar al endpoint de refresh token
      const data = await httpClient.post('/api/auth/refresh-token', { refreshToken }, { skipAuthRefresh: true });
      
      // Verificar que la respuesta contiene los datos esperados
      if (!data.token) {
        throw new Error('Respuesta de renovación de token inválida');
      }

      // Actualizar el token en localStorage
      localStorage.setItem('fincoopToken', data.token);
      
      // Actualizar el refresh token si se recibe uno nuevo
      if (data.refreshToken) {
        localStorage.setItem('fincoopRefreshToken', data.refreshToken);
      }

      return data;
    } catch (error: any) {
      console.error('Error al renovar token:', {
        message: error.message,
        code: error.code,
        status: error.status
      });
      
      // Limpiar tokens si hay un error de renovación
      localStorage.removeItem('fincoopToken');
      localStorage.removeItem('fincoopRefreshToken');
      
      // Re-lanzar el error para que lo maneje el componente
      throw error;
    }
  },

  /**
   * Registrar un nuevo usuario
   * @param userData Datos del nuevo usuario
   * @returns Datos del usuario creado
   */
  async register(userData: { email: string; password: string; displayName: string; role?: string; officeId?: string }) {
    try {
      return await httpClient.post('/api/auth/register', userData);
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
  async getProfile() {
    try {
      return await httpClient.get('/api/auth/profile');
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
  async updateProfile(userData: { displayName?: string; photoURL?: string }) {
    try {
      return await httpClient.put('/api/auth/profile', userData);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  },

  /**
   * Sube una imagen de perfil al servidor
   * @param imageFile Archivo de imagen a subir
   * @returns Datos actualizados del usuario con la nueva URL de imagen
   */
  async uploadProfileImage(imageFile: File) {
    try {
      // Crear un objeto FormData para enviar el archivo
      const formData = new FormData();
      formData.append('image', imageFile);
      
      // Usar la URL exacta que funciona
      return await httpClient.upload('/api/auth/profile/image', formData);
    } catch (error) {
      console.error('Error al subir imagen de perfil:', error);
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
      return await httpClient.post('/api/auth/password-reset', { email });
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
      return await httpClient.post('/api/auth/send-verification-email', { email });
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
      return await httpClient.post('/api/auth/verify-email', { oobCode });
    } catch (error) {
      console.error('Error al verificar email:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los usuarios (solo para administradores)
   * @param token Token JWT del administrador
   * @returns Lista de usuarios
   */
  async getAllUsers() {
    try {
      return await httpClient.get('/api/auth/users');
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  },

  /**
   * Actualizar el rol de un usuario (solo para administradores)
   * @param userId ID del usuario a actualizar
   * @param newRole Nuevo rol a asignar
   * @param officeId ID de la oficina (requerido para roles de gerente/analista)
   * @returns Usuario actualizado
   */
  async updateUserRole(userId: string, newRole: string, officeId?: string) {
    try {
      const payload: any = {
        role: newRole
      };
      
      // Incluir officeId solo si se proporciona
      if (officeId) {
        payload.officeId = officeId;
      }
      
      return await httpClient.put(`/api/auth/users/${userId}/role`, payload);
    } catch (error) {
      console.error('Error al actualizar rol de usuario:', error);
      throw error;
    }
  },

  /**
   * Eliminar un usuario (solo para administradores)
   * @param token Token JWT del administrador
   * @param userId ID del usuario a eliminar
   * @returns Mensaje de confirmación
   */
  async deleteUser(userId: string) {
    try {
      return await httpClient.delete(`/api/auth/users/${userId}`);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }
};
