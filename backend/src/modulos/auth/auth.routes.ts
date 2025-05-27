import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from './auth.middleware';
import { UserRole } from './interfaces/user.interface';

export class AuthRoutes {
  private router: Router;
  private authController: AuthController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.authMiddleware = new AuthMiddleware();
    this.configureRoutes();
  }

  private configureRoutes(): void {
    // Rutas públicas
    this.router.post('/register', this.authController.register.bind(this.authController));
    this.router.post('/login', this.authController.login.bind(this.authController));
    this.router.post('/password-reset', this.authController.requestPasswordReset.bind(this.authController));
    
    // Rutas para verificación de email
    this.router.post('/verify-email', this.authController.verifyEmail.bind(this.authController));
    this.router.post('/send-verification-email', this.authController.sendEmailVerification.bind(this.authController));

    // Rutas protegidas - requieren autenticación
    this.router.get(
      '/profile', 
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.authController.getProfile.bind(this.authController)
    );
    
    this.router.put(
      '/profile', 
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.authController.updateProfile.bind(this.authController)
    );
    
    this.router.post(
      '/change-password', 
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.authController.changePassword.bind(this.authController)
    );

    // Rutas de administración - requieren rol de administrador
    this.router.get(
      '/users', 
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.authMiddleware.hasRole(UserRole.ADMIN),
      this.authController.getAllUsers.bind(this.authController)
    );
    
    this.router.put(
      '/users/role', 
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.authMiddleware.hasRole(UserRole.ADMIN),
      this.authController.updateUserRole.bind(this.authController)
    );
    
    this.router.delete(
      '/users/:userId', 
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.authMiddleware.hasRole(UserRole.ADMIN),
      this.authController.deleteUser.bind(this.authController)
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
