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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const admin = __importStar(require("firebase-admin"));
const axios_1 = __importDefault(require("axios"));
const nodemailer = __importStar(require("nodemailer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const base_firebaseRepository_1 = require("../../base/base.firebaseRepository");
const user_interface_1 = require("./interfaces/user.interface");
const dotenv = __importStar(require("dotenv"));
// Cargar variables de entorno
dotenv.config();
class AuthRepository extends base_firebaseRepository_1.BaseFirebaseRepository {
    constructor() {
        super('users'); // Nombre de la colección en Firestore
        this.auth = admin.auth();
        this.FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || '';
        if (!this.FIREBASE_API_KEY) {
            console.warn('ADVERTENCIA: FIREBASE_API_KEY no está configurada en las variables de entorno');
        }
    }
    /**
     * Crea un nuevo usuario en Firebase Authentication y Firestore
     */
    async createUser(email, password, displayName, role = user_interface_1.UserRole.USER, officeId) {
        try {
            // Crear usuario en Firebase Auth
            const userRecord = await this.auth.createUser({
                email,
                password,
                displayName,
                emailVerified: false,
                disabled: false,
            });
            // Crear documento de usuario en Firestore con datos adicionales
            const userData = {
                uid: userRecord.uid,
                email: userRecord.email || email,
                displayName: userRecord.displayName || displayName,
                photoURL: userRecord.photoURL || '',
                role,
                permissions: this.getDefaultPermissionsForRole(role),
                createdAt: Date.now(),
                updatedAt: Date.now(),
                emailVerified: userRecord.emailVerified || false,
                disabled: userRecord.disabled || false,
            };
            // Agregar officeId solo para usuarios con rol de gerente
            if (role === user_interface_1.UserRole.GERENTE_OFICINA && officeId) {
                userData.officeId = officeId;
            }
            // Guardar en Firestore usando el UID como ID del documento
            await this.collection.doc(userRecord.uid).set(userData);
            // Establecer claims personalizados para JWT
            const claims = {
                role,
                permissions: this.getDefaultPermissionsForRole(role),
            };
            // Incluir officeId en los claims para gerentes
            if (role === user_interface_1.UserRole.GERENTE_OFICINA && officeId) {
                claims.officeId = officeId;
            }
            await this.auth.setCustomUserClaims(userRecord.uid, claims);
            return userData;
        }
        catch (error) {
            console.error('Error al crear usuario:', error);
            throw error;
        }
    }
    /**
     * Obtiene un usuario por su ID
     */
    async getUserById(uid) {
        try {
            // Obtener datos de Firebase Auth
            const userRecord = await this.auth.getUser(uid);
            // Obtener datos adicionales de Firestore
            const userDoc = await this.collection.doc(uid).get();
            if (!userDoc.exists) {
                return null;
            }
            const userData = userDoc.data();
            // Combinar datos de Auth y Firestore
            return {
                ...userData,
                email: userRecord.email || userData.email,
                displayName: userRecord.displayName || userData.displayName,
                photoURL: userRecord.photoURL || userData.photoURL,
                emailVerified: userRecord.emailVerified,
                disabled: userRecord.disabled,
            };
        }
        catch (error) {
            console.error('Error al obtener usuario por ID:', error);
            throw error;
        }
    }
    /**
     * Obtiene un usuario por su email
     */
    async getUserByEmail(email) {
        try {
            const userRecord = await this.auth.getUserByEmail(email);
            return this.getUserById(userRecord.uid);
        }
        catch (error) {
            if (error.code === 'auth/user-not-found') {
                return null;
            }
            throw error;
        }
    }
    /**
     * Actualiza los datos de un usuario
     */
    async updateUser(uid, userData) {
        try {
            // Actualizar en Firebase Auth
            const authUpdateData = {};
            if (userData.displayName)
                authUpdateData.displayName = userData.displayName;
            if (userData.photoURL)
                authUpdateData.photoURL = userData.photoURL;
            if (userData.disabled !== undefined)
                authUpdateData.disabled = userData.disabled;
            // Usar admin.auth() directamente para asegurar que se actualice en Firebase Authentication
            await admin.auth().updateUser(uid, authUpdateData);
            console.log(`Usuario actualizado en Firebase Authentication: ${uid}`, authUpdateData);
            // Actualizar en Firestore
            const updateData = {
                ...userData,
                updatedAt: Date.now()
            };
            await this.collection.doc(uid).update(updateData);
            console.log(`Usuario actualizado en Firestore: ${uid}`, updateData);
            // Si se actualizó el rol, actualizar también los claims
            if (userData.role) {
                const permissions = userData.permissions || this.getDefaultPermissionsForRole(userData.role);
                const claims = {
                    role: userData.role,
                    permissions
                };
                // Incluir officeId en los claims para gerentes
                if (userData.role === user_interface_1.UserRole.GERENTE_OFICINA && userData.officeId) {
                    claims.officeId = userData.officeId;
                }
                else if (userData.role !== user_interface_1.UserRole.GERENTE_OFICINA) {
                    // Si el rol cambió y ya no es gerente, eliminar officeId de los claims
                    claims.officeId = null;
                }
                await this.auth.setCustomUserClaims(uid, claims);
            }
            // Obtener usuario actualizado
            return this.getUserById(uid);
        }
        catch (error) {
            console.error('Error al actualizar usuario:', error);
            throw error;
        }
    }
    /**
     * Actualiza el rol de un usuario
     */
    async updateUserRole(uid, role) {
        return this.updateUser(uid, {
            role,
            permissions: this.getDefaultPermissionsForRole(role)
        });
    }
    /**
     * Elimina un usuario
     */
    async deleteUser(uid) {
        try {
            // Eliminar de Firebase Auth
            await this.auth.deleteUser(uid);
            // Eliminar de Firestore
            await this.collection.doc(uid).delete();
            return true;
        }
        catch (error) {
            console.error('Error al eliminar usuario:', error);
            throw error;
        }
    }
    /**
     * Obtiene todos los usuarios
     */
    async getAllUsers(limit = 1000) {
        try {
            // Obtener lista de usuarios de Firebase Auth
            const listUsersResult = await this.auth.listUsers(limit);
            // Obtener datos adicionales de Firestore para cada usuario
            const users = [];
            for (const userRecord of listUsersResult.users) {
                const userDoc = await this.collection.doc(userRecord.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    users.push({
                        ...userData,
                        email: userRecord.email || userData.email,
                        displayName: userRecord.displayName || userData.displayName,
                        photoURL: userRecord.photoURL || userData.photoURL,
                        emailVerified: userRecord.emailVerified,
                        disabled: userRecord.disabled,
                    });
                }
            }
            return users;
        }
        catch (error) {
            console.error('Error al obtener todos los usuarios:', error);
            throw error;
        }
    }
    /**
     * Genera un token JWT personalizado para un usuario
     */
    async generateCustomToken(uid) {
        try {
            return await this.auth.createCustomToken(uid);
        }
        catch (error) {
            console.error('Error al generar token personalizado:', error);
            throw error;
        }
    }
    /**
     * Verifica un token ID de Firebase
     */
    async verifyIdToken(idToken) {
        try {
            return await this.auth.verifyIdToken(idToken);
        }
        catch (error) {
            console.error('Error al verificar token ID:', error);
            throw error;
        }
    }
    /**
     * Envía un correo de verificación de email al usuario
     * Utiliza el método recomendado por Firebase con Nodemailer para el envío de correos
     */
    async sendEmailVerification(email) {
        try {
            // Obtener el usuario por email
            const userRecord = await this.auth.getUserByEmail(email);
            if (!userRecord) {
                throw { code: 'auth/user-not-found', message: 'Usuario no encontrado' };
            }
            // Verificar si el usuario ya está verificado
            if (userRecord.emailVerified) {
                console.log(`El email ${email} ya está verificado`);
                return;
            }
            // Configurar las opciones para el enlace de verificación
            const actionCodeSettings = {
                // URL a la que se redirigirá después de verificar el correo
                // Debe incluir la ruta completa a la página de verificación
                url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email`,
                // Esta opción debe ser false para que Firebase incluya el oobCode como parámetro en la URL
                handleCodeInApp: false
            };
            try {
                // Generar un token de verificación personalizado usando el UID del usuario
                // Este enfoque es más directo que depender del comportamiento de Firebase
                const customToken = userRecord.uid;
                // Crear un enlace de verificación personalizado que incluya el token
                const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?oobCode=${customToken}`;
                console.log(`Enlace de verificación generado: ${verificationLink}`);
                // Leer la plantilla HTML del correo de verificación
                const templatePath = path_1.default.join(__dirname, '../../templates/email/verification-email.html');
                let htmlTemplate = fs_1.default.readFileSync(templatePath, 'utf-8');
                // Reemplazar la variable de enlace en la plantilla
                htmlTemplate = htmlTemplate.replace(/{{verificationLink}}/g, verificationLink);
                // Configurar el transporte de email con Nodemailer
                const transporter = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                    port: parseInt(process.env.EMAIL_PORT || '587'),
                    secure: process.env.EMAIL_SECURE === 'true',
                    auth: {
                        user: process.env.EMAIL_USER || '',
                        pass: process.env.EMAIL_PASSWORD || ''
                    }
                });
                // Configurar el contenido del email
                const mailOptions = {
                    from: process.env.EMAIL_FROM || 'noreply@cooperativa.fin.ec',
                    to: email,
                    subject: 'Verifica tu dirección de email - Cooperativa de Ahorro y Crédito',
                    html: htmlTemplate
                };
                // Verificar si las credenciales de email están configuradas
                if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
                    // Si no hay credenciales, simplemente mostramos el enlace en la consola
                    console.log(`Enlace de verificación para ${email}: ${verificationLink}`);
                    console.warn('ADVERTENCIA: Credenciales de email no configuradas. El correo no se envió.');
                    console.warn('Configura EMAIL_USER y EMAIL_PASSWORD en las variables de entorno para enviar correos reales.');
                    return;
                }
                // Enviar el email
                await transporter.sendMail(mailOptions);
                console.log(`Correo de verificación enviado a ${email}`);
            }
            catch (error) {
                console.error('Error al generar/enviar enlace de verificación:', error);
                // Si hay un error con Firebase o el envío de correo, informamos al usuario
                throw {
                    code: 'auth/email-verification-failed',
                    message: 'No se pudo enviar el correo de verificación. Por favor, inténtalo más tarde.'
                };
            }
            return;
        }
        catch (error) {
            console.error('Error al enviar correo de verificación:', error);
            throw error;
        }
    }
    /**
     * Verifica el email de un usuario usando un código de verificación
     *
     * En nuestro enfoque personalizado, el código de verificación es simplemente el UID del usuario.
     * Este método marca el email del usuario como verificado en Firebase Auth y Firestore.
     */
    async verifyEmail(oobCode) {
        try {
            console.log(`Procesando código de verificación: ${oobCode}`);
            // En nuestro enfoque personalizado, el oobCode es el UID del usuario
            try {
                // Verificar si el código corresponde a un UID válido
                const userRecord = await this.auth.getUser(oobCode);
                // Si llegamos aquí, el UID es válido
                console.log(`Usuario encontrado: ${userRecord.email}`);
                // Verificar si el email ya está verificado
                if (userRecord.emailVerified) {
                    console.log(`El email ${userRecord.email} ya está verificado`);
                    return true;
                }
                // Marcar el email como verificado en Firebase Auth
                await this.auth.updateUser(oobCode, {
                    emailVerified: true
                });
                // Actualizar también en Firestore
                await this.collection.doc(oobCode).update({
                    emailVerified: true,
                    updatedAt: Date.now()
                });
                console.log(`Email ${userRecord.email} verificado correctamente`);
                return true;
            }
            catch (error) {
                console.error('Error al verificar email:', error);
                // Si hay un error, intentamos un enfoque alternativo
                // Esto puede ocurrir si el oobCode no es un UID válido
                // En ese caso, podemos intentar buscar al usuario por email si tenemos esa información
                // Como no tenemos acceso a más información en este punto, devolvemos false
                return false;
            }
        }
        catch (error) {
            console.error('Error general al verificar email:', error);
            throw error;
        }
    }
    /**
     * Autentica a un usuario con email y contraseña usando la API REST de Firebase
     * @param email Email del usuario
     * @param password Contraseña del usuario
     * @returns Resultado de la autenticación con idToken
     */
    async signInWithEmailAndPassword(email, password) {
        try {
            if (!this.FIREBASE_API_KEY) {
                throw new Error('FIREBASE_API_KEY no está configurada');
            }
            // Usar la API REST de Firebase para autenticar
            const response = await axios_1.default.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.FIREBASE_API_KEY}`, {
                email,
                password,
                returnSecureToken: true
            });
            // Extraer el idToken y otros datos importantes
            const { idToken, refreshToken, expiresIn, localId } = response.data;
            return {
                success: true,
                message: 'Autenticación exitosa',
                data: response.data,
                idToken: idToken, // Exponer el idToken directamente para facilitar su acceso
                refreshToken: refreshToken // Exponer el refreshToken para renovación de sesión
            };
        }
        catch (error) {
            console.error('Error en autenticación con Firebase:', error.response?.data || error.message);
            // Manejar errores específicos de Firebase Auth
            const errorCode = error.response?.data?.error?.message || 'auth/unknown-error';
            const errorMessage = this.getFirebaseAuthErrorMessage(errorCode);
            return {
                success: false,
                code: errorCode,
                message: errorMessage
            };
        }
    }
    /**
     * Renueva un token de acceso usando un refresh token
     * @param refreshToken Token de actualización
     * @returns Nuevo token de acceso y refresh token
     */
    async refreshAccessToken(refreshToken) {
        try {
            if (!this.FIREBASE_API_KEY) {
                throw new Error('FIREBASE_API_KEY no está configurada');
            }
            // Usar la API REST de Firebase para renovar el token
            const response = await axios_1.default.post(`https://securetoken.googleapis.com/v1/token?key=${this.FIREBASE_API_KEY}`, {
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            });
            // Extraer el nuevo idToken y otros datos importantes
            const { id_token, refresh_token, expires_in, user_id } = response.data;
            return {
                success: true,
                message: 'Token renovado exitosamente',
                data: response.data,
                idToken: id_token,
                refreshToken: refresh_token
            };
        }
        catch (error) {
            console.error('Error al renovar token:', error.response?.data || error.message);
            // Manejar errores específicos
            const errorCode = error.response?.data?.error?.message || 'auth/unknown-error';
            const errorMessage = this.getFirebaseAuthErrorMessage(errorCode);
            return {
                success: false,
                code: errorCode,
                message: errorMessage
            };
        }
    }
    /**
     * Actualiza la marca de tiempo del último inicio de sesión del usuario
     * @param uid ID del usuario
     */
    async updateLastLogin(uid) {
        try {
            await this.collection.doc(uid).update({
                lastLoginAt: Date.now(),
                updatedAt: Date.now()
            });
        }
        catch (error) {
            console.error('Error al actualizar último inicio de sesión:', error);
            // No lanzamos el error para no interrumpir el flujo de login
        }
    }
    /**
     * Obtiene un mensaje de error amigable basado en el código de error de Firebase Auth
     * @param errorCode Código de error de Firebase Auth
     * @returns Mensaje de error amigable
     */
    getFirebaseAuthErrorMessage(errorCode) {
        switch (errorCode) {
            case 'auth/invalid-email':
                return 'El formato del email no es válido';
            case 'auth/user-disabled':
                return 'Esta cuenta ha sido deshabilitada';
            case 'auth/user-not-found':
                return 'No existe una cuenta con este email';
            case 'auth/wrong-password':
                return 'Contraseña incorrecta';
            case 'auth/email-already-in-use':
                return 'Este email ya está en uso por otra cuenta';
            case 'auth/weak-password':
                return 'La contraseña debe tener al menos 6 caracteres';
            case 'auth/operation-not-allowed':
                return 'Operación no permitida';
            case 'auth/too-many-requests':
                return 'Demasiados intentos fallidos. Intente más tarde';
            case 'auth/invalid-credential':
            case 'auth/invalid-login-credentials':
                return 'Credenciales inválidas';
            default:
                return 'Error de autenticación';
        }
    }
    /**
     * Obtiene los permisos predeterminados para un rol
     */
    getDefaultPermissionsForRole(role) {
        switch (role) {
            case user_interface_1.UserRole.ADMIN:
                return [
                    'users:read', 'users:write', 'users:delete',
                    'reports:read', 'reports:write', 'reports:delete',
                    'settings:read', 'settings:write',
                    'office:manage', 'analytics:manage'
                ];
            case user_interface_1.UserRole.GERENTE_GENERAL:
                // Gerente general puede ver todo y gestionar algunos datos
                return [
                    'users:read',
                    'reports:read', 'reports:write', 'reports:delete',
                    'settings:read', 'settings:write',
                    'analytics:manage',
                    'dashboard:full'
                ];
            case user_interface_1.UserRole.GERENTE_OFICINA:
                return [
                    'users:read',
                    'reports:read', 'reports:write',
                    'settings:read',
                    'office:manage',
                    'dashboard:office'
                ];
            case user_interface_1.UserRole.ANALISTA:
                // Analista solo puede ver datos y generar reportes
                return [
                    'reports:read', 'reports:write',
                    'settings:read',
                    'analytics:read',
                    'dashboard:read'
                ];
            case user_interface_1.UserRole.EDITOR:
                return [
                    'users:read',
                    'reports:read', 'reports:write',
                    'settings:read'
                ];
            case user_interface_1.UserRole.USER:
            default:
                return [
                    'reports:read',
                    'settings:read'
                ];
        }
    }
}
exports.AuthRepository = AuthRepository;
