"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("./auth.middleware");
const upload_controller_1 = require("./upload.controller");
const user_interface_1 = require("./interfaces/user.interface");
class AuthRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.authController = new auth_controller_1.AuthController();
        this.authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.uploadController = new upload_controller_1.UploadController();
        this.configureRoutes();
    }
    configureRoutes() {
        // Rutas públicas
        this.router.post('/register', this.authController.register.bind(this.authController));
        this.router.post('/login', this.authController.login.bind(this.authController));
        this.router.post('/password-reset', this.authController.requestPasswordReset.bind(this.authController));
        this.router.post('/refresh-token', this.authController.refreshToken.bind(this.authController));
        // Rutas para verificación de email
        this.router.post('/verify-email', this.authController.verifyEmail.bind(this.authController));
        this.router.post('/send-verification-email', this.authController.sendEmailVerification.bind(this.authController));
        // Rutas protegidas - requieren autenticación
        this.router.get('/profile', this.authMiddleware.verifyToken.bind(this.authMiddleware), this.authController.getProfile.bind(this.authController));
        this.router.put('/profile', this.authMiddleware.verifyToken.bind(this.authMiddleware), this.authController.updateProfile.bind(this.authController));
        // Ruta para subir imagen de perfil
        this.router.post('/profile/image', this.authMiddleware.verifyToken.bind(this.authMiddleware), this.uploadController.uploadMiddleware, this.uploadController.uploadProfileImage.bind(this.uploadController));
        this.router.post('/change-password', this.authMiddleware.verifyToken.bind(this.authMiddleware), this.authController.changePassword.bind(this.authController));
        // Rutas de administración - requieren rol de administrador
        this.router.get('/users', this.authMiddleware.verifyToken.bind(this.authMiddleware), this.authMiddleware.hasRole(user_interface_1.UserRole.ADMIN), this.authController.getAllUsers.bind(this.authController));
        this.router.put('/users/role', this.authMiddleware.verifyToken.bind(this.authMiddleware), this.authMiddleware.hasRole(user_interface_1.UserRole.ADMIN), this.authController.updateUserRole.bind(this.authController));
        this.router.delete('/users/:userId', this.authMiddleware.verifyToken.bind(this.authMiddleware), this.authMiddleware.hasRole(user_interface_1.UserRole.ADMIN), this.authController.deleteUser.bind(this.authController));
    }
    getRouter() {
        return this.router;
    }
}
exports.AuthRoutes = AuthRoutes;
