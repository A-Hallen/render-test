import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { UserRole } from './interfaces/user.interface';

/**
 * Middleware para verificar autenticación mediante token JWT
 */
export class AuthMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Verifica que el usuario esté autenticado
   */
  verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'No autorizado. Token no proporcionado' });
        return;
      }

      const token = authHeader.split(' ')[1];

      try {
        // Verificar token
        const decodedToken = await this.authService.verifyToken(token);
        
        // Añadir información del usuario al objeto request
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          role: decodedToken.role as UserRole || UserRole.USER,
          permissions: decodedToken.permissions || []
        };
        
        next();
      } catch (error: any) {
        console.error('Error al verificar token:', error);
        res.status(401).json({ 
          message: 'Token inválido o expirado',
          code: error.code
        });
      }
    } catch (error: any) {
      console.error('Error en middleware de autenticación:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        code: error.code
      });
    }
  };

  /**
   * Verifica que el usuario tenga el rol requerido
   */
  hasRole = (roles: UserRole | UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        res.status(401).json({ message: 'No autorizado' });
        return;
      }

      const userRole = req.user.role;
      const requiredRoles = Array.isArray(roles) ? roles : [roles];

      // Verificar si el usuario tiene alguno de los roles requeridos
      if (!requiredRoles.includes(userRole)) {
        res.status(403).json({ 
          message: 'Acceso denegado. No tiene los permisos necesarios',
          requiredRoles,
          userRole
        });
        return;
      }

      next();
    };
  };

  /**
   * Verifica que el usuario tenga el permiso requerido
   */
  hasPermission = (permissions: string | string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        res.status(401).json({ message: 'No autorizado' });
        return;
      }

      const userPermissions = req.user.permissions || [];
      const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];

      // Verificar si el usuario tiene todos los permisos requeridos
      const hasAllPermissions = requiredPermissions.every(permission => 
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        res.status(403).json({ 
          message: 'Acceso denegado. No tiene los permisos necesarios',
          requiredPermissions,
          userPermissions
        });
        return;
      }

      next();
    };
  };
}
