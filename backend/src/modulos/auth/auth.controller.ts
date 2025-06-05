import { Request, Response } from 'express';
// Importación explícita del archivo de definición de tipos para Express
import { AuthService } from './auth.service';
import { UserRole } from './interfaces/user.interface';

// Interfaz para la solicitud de refresh token
interface RefreshTokenRequest {
  refreshToken: string;
}

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Registra un nuevo usuario
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, displayName, role = UserRole.USER, officeId } = req.body;

      if (!email || !password || !displayName) {
        res.status(400).json({ message: 'Datos incompletos. Se requiere email, password y displayName' });
        return;
      }

      // Validar que se proporcione officeId cuando el rol es GERENTE_OFICINA o ANALISTA
      if ((role === UserRole.GERENTE_OFICINA || role === UserRole.ANALISTA) && !officeId) {
        res.status(400).json({ 
          message: 'Se requiere ID de oficina para usuarios con rol de gerente o analista',
          code: 'auth/missing-office-id'
        });
        return;
      }

      const result = await this.authService.createUser(email, password, displayName, role, officeId);
      
      // Enviar correo de verificación automáticamente
      try {
        await this.authService.sendEmailVerification(email);
        result.verificationEmailSent = true;
      } catch (verificationError) {
        console.error('Error al enviar correo de verificación:', verificationError);
        result.verificationEmailSent = false;
      }
      
      res.status(201).json(result);
    } catch (error: any) {
      console.error('Error en registro de usuario:', error);
      res.status(error.code === 'auth/email-already-exists' ? 409 : 500).json({
        message: error.message || 'Error al registrar usuario',
        code: error.code
      });
    }
  }

  /**
   * Inicia sesión de usuario y devuelve token JWT
   * @param req Request con email y password en el body
   * @param res Response con datos de autenticación
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Extraer credenciales del body
      const { email, password } = req.body;

      // Validar que se proporcionaron las credenciales
      if (!email || !password) {
        res.status(400).json({ 
          success: false,
          message: 'Se requiere email y password',
          code: 'auth/missing-credentials'
        });
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ 
          success: false,
          message: 'Formato de email inválido',
          code: 'auth/invalid-email-format'
        });
        return;
      }

      // Intentar autenticar al usuario
      const result = await this.authService.login(email, password);
      
      // Registrar inicio de sesión exitoso (sin datos sensibles)
      console.log(`Inicio de sesión exitoso: ${email} (${result.user.role})`);
      
      // Devolver respuesta exitosa
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error: any) {
      // Determinar el código de estado HTTP apropiado según el tipo de error
      const statusCode = this.getStatusCodeForError(error.code);
      
      // Registrar el error (sin datos sensibles)
      console.error(`Error en login (${statusCode}):`, {
        code: error.code,
        message: error.message,
        email: req.body?.email ? `${req.body.email.substring(0, 3)}...` : 'no proporcionado'
      });
      
      // Devolver respuesta de error
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error en autenticación',
        code: error.code || 'auth/unknown-error'
      });
    }
  }
  
  /**
   * Determina el código de estado HTTP apropiado según el código de error de autenticación
   * @param errorCode Código de error de autenticación
   * @returns Código de estado HTTP
   */
  private getStatusCodeForError(errorCode?: string): number {
    if (!errorCode) return 500;
    
    switch (errorCode) {
      // Errores de credenciales (401 Unauthorized)
      case 'auth/wrong-password':
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
      case 'auth/invalid-login-credentials':
      case 'auth/invalid-email':
        return 401;
      
      // Errores de cuenta (403 Forbidden)
      case 'auth/user-disabled':
        return 403;
      
      // Errores de solicitud (400 Bad Request)
      case 'auth/missing-credentials':
      case 'auth/invalid-email-format':
        return 400;
      
      // Errores de limitación (429 Too Many Requests)
      case 'auth/too-many-requests':
        return 429;
      
      // Otros errores (500 Internal Server Error)
      default:
        return 500;
    }
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {

      const userId = req.user?.uid;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }

      const user = await this.authService.getUserById(userId);
      res.status(200).json(user);
    } catch (error: any) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({
        message: error.message || 'Error al obtener perfil de usuario',
        code: error.code
      });
    }
  }

  /**
   * Actualiza el perfil del usuario
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }

      const { displayName, photoURL } = req.body;
      const updatedUser = await this.authService.updateUser(userId, { displayName, photoURL });
      
      res.status(200).json(updatedUser);
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      res.status(500).json({
        message: error.message || 'Error al actualizar perfil de usuario',
        code: error.code
      });
    }
  }

  /**
   * Cambia la contraseña del usuario
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }

      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        res.status(400).json({ message: 'Se requiere contraseña actual y nueva' });
        return;
      }

      await this.authService.changePassword(userId, currentPassword, newPassword);
      res.status(200).json({ message: 'Contraseña actualizada correctamente' });
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      res.status(error.code === 'auth/wrong-password' ? 401 : 500).json({
        message: error.message || 'Error al cambiar contraseña',
        code: error.code
      });
    }
  }

  /**
   * Solicita restablecimiento de contraseña
   */
  async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      
      if (!email) {
        res.status(400).json({ message: 'Se requiere email' });
        return;
      }

      await this.authService.sendPasswordResetEmail(email);
      res.status(200).json({ message: 'Correo de restablecimiento enviado' });
    } catch (error: any) {
      console.error('Error al solicitar restablecimiento de contraseña:', error);
      res.status(500).json({
        message: error.message || 'Error al solicitar restablecimiento de contraseña',
        code: error.code
      });
    }
  }

  /**
   * Obtiene todos los usuarios (solo para administradores)
   */
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      // Verificar si el usuario tiene rol de administrador
      const role = req.user?.role;
      
      if (role !== UserRole.ADMIN) {
        res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador' });
        return;
      }

      const users = await this.authService.getAllUsers();
      res.status(200).json(users);
    } catch (error: any) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({
        message: error.message || 'Error al obtener lista de usuarios',
        code: error.code
      });
    }
  }

  /**
   * Actualiza el rol de un usuario (solo para administradores)
   */
  async updateUserRole(req: Request, res: Response): Promise<void> {
    try {
      // Verificar si el usuario tiene rol de administrador
      const role = req.user?.role;
      
      if (role !== UserRole.ADMIN) {
        res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador' });
        return;
      }

      const { userId, newRole, officeId } = req.body;
      
      if (!userId || !newRole) {
        res.status(400).json({ message: 'Se requiere userId y newRole' });
        return;
      }

      // Validar que se proporcione officeId cuando el rol es GERENTE_OFICINA o ANALISTA
      if ((newRole === UserRole.GERENTE_OFICINA || newRole === UserRole.ANALISTA) && !officeId) {
        res.status(400).json({ 
          message: 'Se requiere ID de oficina para usuarios con rol de gerente o analista',
          code: 'auth/missing-office-id'
        });
        return;
      }

      const updatedUser = await this.authService.updateUserRole(userId, newRole, officeId);
      res.status(200).json(updatedUser);
    } catch (error: any) {
      console.error('Error al actualizar rol de usuario:', error);
      res.status(500).json({
        message: error.message || 'Error al actualizar rol de usuario',
        code: error.code
      });
    }
  }

  /**
   * Elimina un usuario (solo para administradores)
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      // Verificar si el usuario tiene rol de administrador
      const role = req.user?.role;
      
      // if (role !== UserRole.ADMIN) {
      //   res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador' });
      //   return;
      // }

      const { userId } = req.params;
      
      if (!userId) {
        res.status(400).json({ message: 'Se requiere userId' });
        return;
      }

      const result = await this.authService.deleteUser(userId);
      
      if (result) {
        res.status(200).json({ message: 'Usuario eliminado correctamente' });
      } else {
        res.status(404).json({ message: 'Usuario no encontrado' });
      }
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({
        message: error.message || 'Error al eliminar usuario',
        code: error.code
      });
    }
  }

  /**
   * Envía un correo de verificación de email al usuario
   */
  async sendEmailVerification(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      
      if (!email) {
        res.status(400).json({ message: 'Se requiere email' });
        return;
      }

      await this.authService.sendEmailVerification(email);
      res.status(200).json({ message: 'Correo de verificación enviado correctamente' });
    } catch (error: any) {
      console.error('Error al enviar correo de verificación:', error);
      res.status(500).json({
        message: error.message || 'Error al enviar correo de verificación',
        code: error.code
      });
    }
  }

  /**
   * Verifica el email de un usuario usando un código de verificación
   */
  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { oobCode } = req.body;
      
      if (!oobCode) {
        res.status(400).json({ message: 'Se requiere código de verificación' });
        return;
      }

      const result = await this.authService.verifyEmail(oobCode);
      
      if (result) {
        res.status(200).json({ message: 'Email verificado correctamente' });
      } else {
        res.status(400).json({ message: 'Código de verificación inválido o expirado' });
      }
    } catch (error: any) {
      console.error('Error al verificar email:', error);
      res.status(500).json({
        message: error.message || 'Error al verificar email',
        code: error.code
      });
    }
  }

  /**
   * Renueva el token de acceso usando un refresh token
   * @param req Request con refreshToken en el body
   * @param res Response con nuevo token y refresh token
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        res.status(400).json({ 
          success: false,
          message: 'Se requiere refresh token',
          code: 'auth/missing-refresh-token'
        });
        return;
      }

      const result = await this.authService.refreshToken(refreshToken);
      
      res.status(200).json({
        success: true,
        token: result.token,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn
      });
    } catch (error: any) {
      // Determinar el código de estado HTTP apropiado
      const statusCode = error.code === 'auth/invalid-refresh-token' ? 401 : 500;
      
      console.error(`Error en refresh token (${statusCode}):`, {
        code: error.code,
        message: error.message
      });
      
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al renovar token',
        code: error.code || 'auth/unknown-error'
      });
    }
  }
}
