"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const admin = __importStar(require("firebase-admin"));
const auth_repository_1 = require("./auth.repository");
const user_interface_1 = require("./interfaces/user.interface");
class AuthService {
    constructor() {
        this.authRepository = new auth_repository_1.AuthRepository();
    }
    /**
     * Crea un nuevo usuario
     */
    async createUser(email, password, displayName, role = user_interface_1.UserRole.USER, officeId) {
        try {
            // Validar que se proporcione officeId cuando el rol es GERENTE_OFICINA o ANALISTA
            if ((role === user_interface_1.UserRole.GERENTE_OFICINA || role === user_interface_1.UserRole.ANALISTA) && !officeId) {
                throw { code: 'auth/missing-office-id', message: 'Se requiere ID de oficina para usuarios con rol de gerente o analista' };
            }
            return await this.authRepository.createUser(email, password, displayName, role, officeId);
        }
        catch (error) {
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
    async login(email, password) {
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
            // Verificar que tenemos un ID token válido
            if (!authResult.idToken) {
                throw { code: 'auth/invalid-token', message: 'No se pudo obtener un token válido' };
            }
            // Usamos directamente el idToken de la respuesta de Firebase Auth
            const token = authResult.idToken;
            const refreshToken = authResult.refreshToken;
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
                refreshToken, // Incluir el refresh token en la respuesta
                expiresIn: 3600 // 1 hora
            };
        }
        catch (error) {
            console.error('Error en servicio al iniciar sesión:', error);
            // Transformar errores específicos de Firebase a un formato consistente
            if (error.code) {
                throw error;
            }
            else {
                throw { code: 'auth/unknown-error', message: 'Error desconocido al iniciar sesión' };
            }
        }
    }
    /**
     * Renueva un token de acceso usando un refresh token
     * @param refreshToken Token de actualización
     * @returns Nuevo token de acceso y refresh token
     * @throws Error si el refresh token es inválido o ha expirado
     */
    async refreshToken(refreshToken) {
        try {
            if (!refreshToken) {
                throw { code: 'auth/invalid-refresh-token', message: 'Refresh token no proporcionado' };
            }
            // Intentar renovar el token usando el refresh token
            const result = await this.authRepository.refreshAccessToken(refreshToken);
            if (!result.success || !result.idToken) {
                throw { code: result.code || 'auth/invalid-refresh-token', message: result.message || 'No se pudo renovar el token' };
            }
            return {
                token: result.idToken,
                refreshToken: result.refreshToken || refreshToken, // Usar el nuevo refresh token si está disponible
                expiresIn: 3600 // 1 hora
            };
        }
        catch (error) {
            console.error('Error al renovar token:', error);
            // Transformar errores a un formato consistente
            if (error.code) {
                throw error;
            }
            else {
                throw { code: 'auth/unknown-error', message: 'Error desconocido al renovar token' };
            }
        }
    }
    /**
     * Obtiene un usuario por su ID
     */
    async getUserById(uid) {
        try {
            return await this.authRepository.getUserById(uid);
        }
        catch (error) {
            console.error('Error en servicio al obtener usuario por ID:', error);
            throw error;
        }
    }
    /**
     * Actualiza los datos de un usuario
     */
    async updateUser(uid, userData) {
        try {
            return await this.authRepository.updateUser(uid, userData);
        }
        catch (error) {
            console.error('Error en servicio al actualizar usuario:', error);
            throw error;
        }
    }
    /**
     * Actualiza el rol de un usuario
     */
    async updateUserRole(uid, role, officeId) {
        try {
            // Validar que se proporcione officeId cuando el rol es GERENTE_OFICINA o ANALISTA
            if ((role === user_interface_1.UserRole.GERENTE_OFICINA || role === user_interface_1.UserRole.ANALISTA) && !officeId) {
                throw { code: 'auth/missing-office-id', message: 'Se requiere ID de oficina para usuarios con rol de gerente o analista' };
            }
            // Si el rol es gerente o analista, actualizar también el officeId
            if ((role === user_interface_1.UserRole.GERENTE_OFICINA || role === user_interface_1.UserRole.ANALISTA) && officeId) {
                return await this.authRepository.updateUser(uid, { role, officeId });
            }
            else {
                return await this.authRepository.updateUserRole(uid, role);
            }
        }
        catch (error) {
            console.error('Error en servicio al actualizar rol de usuario:', error);
            throw error;
        }
    }
    /**
     * Cambia la contraseña de un usuario
     */
    async changePassword(uid, currentPassword, newPassword) {
        try {
            // Firebase Admin SDK no proporciona una forma directa de cambiar contraseña
            // En una aplicación real, esto se haría con Firebase Auth REST API o SDK cliente
            // En producción, deberías usar Firebase Auth REST API para cambiar contraseña
            // Esta es una implementación simplificada para demostración
            // Actualizar contraseña directamente (en producción necesitarías verificar la contraseña actual)
            await admin.auth().updateUser(uid, {
                password: newPassword
            });
        }
        catch (error) {
            console.error('Error en servicio al cambiar contraseña:', error);
            throw error;
        }
    }
    /**
     * Envía un correo de restablecimiento de contraseña
     */
    async sendPasswordResetEmail(email) {
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
        }
        catch (error) {
            console.error('Error en servicio al enviar correo de restablecimiento:', error);
            throw error;
        }
    }
    /**
     * Obtiene todos los usuarios
     */
    async getAllUsers() {
        try {
            return await this.authRepository.getAllUsers();
        }
        catch (error) {
            console.error('Error en servicio al obtener todos los usuarios:', error);
            throw error;
        }
    }
    /**
     * Elimina un usuario
     */
    async deleteUser(uid) {
        try {
            return await this.authRepository.deleteUser(uid);
        }
        catch (error) {
            console.error('Error en servicio al eliminar usuario:', error);
            throw error;
        }
    }
    /**
     * Verifica un token JWT
     */
    async verifyToken(token) {
        try {
            return await this.authRepository.verifyIdToken(token);
        }
        catch (error) {
            console.error('Error en servicio al verificar token:', error);
            throw error;
        }
    }
    /**
     * Envía un correo de verificación de email al usuario
     */
    async sendEmailVerification(email) {
        try {
            await this.authRepository.sendEmailVerification(email);
        }
        catch (error) {
            console.error('Error en servicio al enviar correo de verificación:', error);
            throw error;
        }
    }
    /**
     * Verifica el email de un usuario usando un código de verificación
     */
    async verifyEmail(oobCode) {
        try {
            return await this.authRepository.verifyEmail(oobCode);
        }
        catch (error) {
            console.error('Error en servicio al verificar email:', error);
            throw error;
        }
    }
}
exports.AuthService = AuthService;
