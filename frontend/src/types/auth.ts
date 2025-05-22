// Re-exportar los tipos desde el directorio compartido

import { UserRole } from 'shared/src/types/auth.types';

// Re-exportar tipos con 'export type' para cumplir con 'isolatedModules'
export { UserRole };
export type { 
  User,
  AuthResponse,
  UserUpdateData,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  PasswordResetRequest,
  UpdateRoleRequest,
  AuthApiResponse
} from 'shared/src/types/auth.types';
