/**
 * Tipos compartidos para el módulo de autenticación
 */

/**
 * Roles de usuario disponibles en el sistema
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  EDITOR = 'editor',
  GERENTE_OFICINA = 'gerente_oficina',
  GERENTE_GENERAL = 'gerente_general',
  ANALISTA = 'analista'
}

/**
 * Interfaz que define la estructura de un usuario
 */
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  permissions?: string[];
  officeId?: string; // ID de la oficina asociada para gerentes
  createdAt?: number;
  updatedAt?: number;
  emailVerified?: boolean;
  disabled?: boolean;
  verificationEmailSent?: boolean;
}

/**
 * Respuesta de autenticación con token
 */
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

/**
 * Datos para actualizar un usuario
 */
export interface UserUpdateData {
  displayName?: string;
  photoURL?: string;
  role?: UserRole;
  permissions?: string[];
  officeId?: string; // ID de la oficina asociada para gerentes
  disabled?: boolean;
}

/**
 * Solicitud de inicio de sesión
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Solicitud de registro de usuario
 */
export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  role?: UserRole;
  officeId?: string; // ID de la oficina asociada para gerentes
}

/**
 * Solicitud de cambio de contraseña
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Solicitud de restablecimiento de contraseña
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Solicitud de actualización de rol de usuario
 */
export interface UpdateRoleRequest {
  userId: string;
  newRole: UserRole;
}

/**
 * Respuesta genérica para operaciones de autenticación
 */
export interface AuthApiResponse {
  success: boolean;
  message: string;
  code?: string;
  data?: {
    idToken?: string;
    refreshToken?: string;
    expiresIn?: string;
    localId?: string;
    [key: string]: any;
  };
  idToken?: string; // Para acceso directo al token
}

/**
 * Solicitud de verificación de correo electrónico
 */
export interface EmailVerificationRequest {
  email: string;
}

/**
 * Solicitud para confirmar la verificación de correo electrónico
 */
export interface ConfirmEmailVerificationRequest {
  oobCode: string;
}
