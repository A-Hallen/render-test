import * as admin from 'firebase-admin';
import { AuthRepository } from './auth.repository';
import { User, UserRole, UserUpdateData, AuthResponse } from './interfaces/user.interface';

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  /**
   * Crea un nuevo usuario
   */
  async createUser(email: string, password: string, displayName: string, role: UserRole = UserRole.USER): Promise<User> {
    try {
      return await this.authRepository.createUser(email, password, displayName, role);
    } catch (error) {
      console.error('Error en servicio al crear usuario:', error);
      throw error;
    }
  }

  /**
   * Inicia sesión de usuario y devuelve token JWT
   * @param email Email del usuario
   * @param password Contraseña del usuario
   * @returns Datos del usuario autenticado y token JWT
   * @throws Error si las credenciales son inválidas o hay un problema en la autenticación
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Validar parámetros de entrada
      if (!email || !password) {
        throw { code: 'auth/invalid-credentials', message: 'Email y contraseña son requeridos' };
      }

      // Verificar si el usuario existe
      const user = await this.authRepository.getUserByEmail(email);
      
      if (!user) {
        throw { code: 'auth/user-not-found', message: 'Usuario no encontrado' };
      }

      // Verificar si la cuenta está deshabilitada
      if (user.disabled) {
        throw { code: 'auth/user-disabled', message: 'Esta cuenta ha sido deshabilitada' };
      }

      // Autenticar con Firebase Authentication REST API
      const authResult = await this.authRepository.signInWithEmailAndPassword(email, password);
      
      if (!authResult.success) {
        throw { code: authResult.code || 'auth/invalid-credentials', message: authResult.message || 'Credenciales inválidas' };
      }
      
      // Generar token JWT para la sesión
      const token = await this.authRepository.generateCustomToken(user.uid);
      
      // Actualizar último acceso del usuario
      await this.authRepository.updateLastLogin(user.uid);
      
      // Obtener usuario actualizado con información de último acceso
      const updatedUser = await this.authRepository.getUserById(user.uid);
      
      if (!updatedUser) {
        throw { code: 'auth/user-not-found', message: 'Error al recuperar datos de usuario' };
      }
      
      return {
        user: updatedUser,
        token,
        expiresIn: 3600 // 1 hora
      };
    } catch (error: any) {
      console.error('Error en servicio al iniciar sesión:', error);
      
      // Transformar errores específicos de Firebase a un formato consistente
      if (error.code) {
        throw error;
      } else {
        throw { code: 'auth/unknown-error', message: 'Error desconocido al iniciar sesión' };
      }
    }
  }

  /**
   * Obtiene un usuario por su ID
   */
  async getUserById(uid: string): Promise<User | null> {
    try {
      return await this.authRepository.getUserById(uid);
    } catch (error) {
      console.error('Error en servicio al obtener usuario por ID:', error);
      throw error;
    }
  }

  /**
   * Actualiza los datos de un usuario
   */
  async updateUser(uid: string, userData: UserUpdateData): Promise<User | null> {
    try {
      return await this.authRepository.updateUser(uid, userData);
    } catch (error) {
      console.error('Error en servicio al actualizar usuario:', error);
      throw error;
    }
  }

  /**
   * Actualiza el rol de un usuario
   */
  async updateUserRole(uid: string, role: UserRole): Promise<User | null> {
    try {
      return await this.authRepository.updateUserRole(uid, role);
    } catch (error) {
      console.error('Error en servicio al actualizar rol de usuario:', error);
      throw error;
    }
  }

  /**
   * Cambia la contraseña de un usuario
   */
  async changePassword(uid: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Firebase Admin SDK no proporciona una forma directa de cambiar contraseña
      // En una aplicación real, esto se haría con Firebase Auth REST API o SDK cliente
      
      // En producción, deberías usar Firebase Auth REST API para cambiar contraseña
      // Esta es una implementación simplificada para demostración
      
      // Actualizar contraseña directamente (en producción necesitarías verificar la contraseña actual)
      await admin.auth().updateUser(uid, {
        password: newPassword
      });
    } catch (error) {
      console.error('Error en servicio al cambiar contraseña:', error);
      throw error;
    }
  }

  /**
   * Envía un correo de restablecimiento de contraseña
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      // Firebase Admin SDK no proporciona una forma directa de enviar correos de restablecimiento
      // En una aplicación real, esto se haría con Firebase Auth REST API o SDK cliente
      
      // Verificar si el usuario existe
      const user = await this.authRepository.getUserByEmail(email);
      
      if (!user) {
        throw { code: 'auth/user-not-found', message: 'Usuario no encontrado' };
      }
      
      // En producción, deberías usar Firebase Auth REST API para enviar el correo
      // Esta es una implementación simplificada para demostración
      console.log(`Se enviaría un correo de restablecimiento a ${email}`);
    } catch (error) {
      console.error('Error en servicio al enviar correo de restablecimiento:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los usuarios
   */
  async getAllUsers(): Promise<User[]> {
    try {
      return await this.authRepository.getAllUsers();
    } catch (error) {
      console.error('Error en servicio al obtener todos los usuarios:', error);
      throw error;
    }
  }

  /**
   * Elimina un usuario
   */
  async deleteUser(uid: string): Promise<boolean> {
    try {
      return await this.authRepository.deleteUser(uid);
    } catch (error) {
      console.error('Error en servicio al eliminar usuario:', error);
      throw error;
    }
  }

  /**
   * Verifica un token JWT
   */
  async verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
    try {
      return await this.authRepository.verifyIdToken(token);
    } catch (error) {
      console.error('Error en servicio al verificar token:', error);
      throw error;
    }
  }

  /**
   * Envía un correo de verificación de email al usuario
   */
  async sendEmailVerification(email: string): Promise<void> {
    try {
      await this.authRepository.sendEmailVerification(email);
    } catch (error) {
      console.error('Error en servicio al enviar correo de verificación:', error);
      throw error;
    }
  }

  /**
   * Verifica el email de un usuario usando un código de verificación
   */
  async verifyEmail(oobCode: string): Promise<boolean> {
    try {
      return await this.authRepository.verifyEmail(oobCode);
    } catch (error) {
      console.error('Error en servicio al verificar email:', error);
      throw error;
    }
  }
}
