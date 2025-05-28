import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "../types/auth";
import { authService } from "../services/authService";

// Definir tipos de acciones
export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage'
}

// Definir tipos de recursos
export enum Resource {
  USERS = 'users',
  REPORTS = 'reports',
  SETTINGS = 'settings',
  OFFICE = 'office',
  ANALYTICS = 'analytics',
  DASHBOARD = 'dashboard',
  FINANCIAL_DATA = 'financial_data'
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  sendEmailVerification: (email: string) => Promise<void>;
  verifyEmail: (oobCode: string) => Promise<boolean>;
  isEmailVerified: boolean;
  can: (action: Action, resource: Resource, context?: any) => boolean;
  canAccessFinancialData: (action: Action, data: any) => boolean;
  filterAllowedData: <T extends Record<string, any>>(data: T[]) => T[];
  updateUserState: (updatedUser: User) => void;
  profileVersion: number; // Para forzar re-renderizado cuando cambia la imagen
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [profileVersion, setProfileVersion] = useState<number>(0); // Contador para forzar re-renderizado

  useEffect(() => {
    // Check for saved auth in localStorage
    const savedToken = localStorage.getItem("fincoopToken");
    const savedUser = localStorage.getItem("fincoopUser");

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);
        setIsAuthenticated(true);
        // Establecer el estado de verificación de email
        setIsEmailVerified(parsedUser.emailVerified || false);
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem("fincoopUser");
        localStorage.removeItem("fincoopToken");
      }
    }
  }, []);

  const clearError = () => {
    setError(null);
  };

  /**
   * Inicia sesión de usuario con email y contraseña
   * @param email Email del usuario
   * @param password Contraseña del usuario
   */
  const login = async (email: string, password: string) => {
    // Iniciar proceso de login
    setIsLoading(true);
    setError(null);

    try {
      // Validar datos de entrada
      if (!email || !password) {
        throw new Error("Email y contraseña son requeridos");
      }

      // Realizar solicitud de autenticación
      const response = await authService.login(email, password);

      // Verificar respuesta
      if (!response || !response.user || !response.token) {
        throw new Error("Respuesta de autenticación inválida");
      }

      // Actualizar estado de autenticación
      setUser(response.user);
      setToken(response.token);
      setIsAuthenticated(true);
      // Actualizar estado de verificación de email
      setIsEmailVerified(response.user.emailVerified || false);

      // Guardar en localStorage para persistencia
      localStorage.setItem("fincoopUser", JSON.stringify(response.user));
      localStorage.setItem("fincoopToken", response.token);
      
      // Opcional: guardar tiempo de expiración del token
      if (response.expiresIn) {
        const expirationTime = Date.now() + response.expiresIn * 1000;
        localStorage.setItem("fincoopTokenExpiration", expirationTime.toString());
      }

      // Registrar inicio de sesión exitoso (sin datos sensibles)
      console.log(`Inicio de sesión exitoso: ${response.user.email} (${response.user.role})`);
    } catch (error: any) {
      // Manejar errores de autenticación
      const errorMessage = error.message || "Error al iniciar sesión";
      setError(errorMessage);
      
      // Registrar error (sin datos sensibles)
      console.error("Error en login:", {
        message: errorMessage,
        code: error.code,
        status: error.status
      });
      
      // Limpiar cualquier dato de autenticación parcial
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      setIsEmailVerified(false);
    } finally {
      // Finalizar proceso de carga
      setIsLoading(false);
    }
  };

  /**
   * Envía un correo de verificación al email del usuario
   * @param email Email del usuario a verificar
   */
  const sendEmailVerification = async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authService.sendEmailVerification(email);
      console.log(`Correo de verificación enviado a: ${email}`);
    } catch (error: any) {
      const errorMessage = error.message || "Error al enviar correo de verificación";
      setError(errorMessage);
      console.error("Error al enviar verificación:", {
        message: errorMessage,
        code: error.code,
        status: error.status
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verifica el email del usuario usando un código de verificación
   * @param oobCode Código de verificación recibido por email
   * @returns true si la verificación fue exitosa
   */
  const verifyEmail = async (oobCode: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authService.verifyEmail(oobCode);
      
      // Si hay un usuario autenticado, actualizar su estado de verificación
      if (user) {
        const updatedUser = { ...user, emailVerified: true };
        setUser(updatedUser);
        setIsEmailVerified(true);
        
        // Actualizar en localStorage
        localStorage.setItem("fincoopUser", JSON.stringify(updatedUser));
      }
      
      return true;
    } catch (error: any) {
      const errorMessage = error.message || "Error al verificar email";
      setError(errorMessage);
      console.error("Error al verificar email:", {
        message: errorMessage,
        code: error.code,
        status: error.status
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setIsEmailVerified(false);
    localStorage.removeItem("fincoopUser");
    localStorage.removeItem("fincoopToken");
  };

  /**
   * Verifica si el usuario puede realizar una acción sobre un recurso específico
   * @param action La acción que se quiere realizar
   * @param resource El recurso sobre el que se quiere actuar
   * @param context Contexto adicional para la verificación (ej: ID de oficina)
   * @returns true si el usuario tiene permiso, false en caso contrario
   */
  const can = (action: Action, resource: Resource, context?: any): boolean => {
    if (!user || !user.permissions) {
      return false;
    }
    
    // Verificar permisos explícitos primero
    const hasPermission = checkExplicitPermissions(action, resource, context);
    if (hasPermission) {
      return true;
    }
    
    // Verificar permisos basados en rol si no tiene permisos explícitos
    return checkRoleBasedPermissions(action, resource, context);
  };

  /**
   * Verifica permisos explícitos del usuario
   */
  const checkExplicitPermissions = (action: Action, resource: Resource, context?: any): boolean => {
    if (!user || !user.permissions || user.permissions.length === 0) {
      return false;
    }
    
    // Mapeo de permisos a acciones y recursos
    const permissionMap: Record<string, { resource: Resource, actions: Action[] }> = {
      'users:read': { resource: Resource.USERS, actions: [Action.READ] },
      'users:write': { resource: Resource.USERS, actions: [Action.CREATE, Action.UPDATE] },
      'users:delete': { resource: Resource.USERS, actions: [Action.DELETE] },
      
      'reports:read': { resource: Resource.REPORTS, actions: [Action.READ] },
      'reports:write': { resource: Resource.REPORTS, actions: [Action.CREATE, Action.UPDATE] },
      'reports:delete': { resource: Resource.REPORTS, actions: [Action.DELETE] },
      
      'settings:read': { resource: Resource.SETTINGS, actions: [Action.READ] },
      'settings:write': { resource: Resource.SETTINGS, actions: [Action.CREATE, Action.UPDATE] },
      
      'office:manage': { resource: Resource.OFFICE, actions: [Action.MANAGE, Action.READ, Action.CREATE, Action.UPDATE] },
      
      'analytics:read': { resource: Resource.ANALYTICS, actions: [Action.READ] },
      'analytics:manage': { resource: Resource.ANALYTICS, actions: [Action.MANAGE, Action.READ, Action.CREATE, Action.UPDATE] },
      
      'dashboard:read': { resource: Resource.DASHBOARD, actions: [Action.READ] },
      'dashboard:office': { resource: Resource.DASHBOARD, actions: [Action.READ] },
      'dashboard:full': { resource: Resource.DASHBOARD, actions: [Action.MANAGE, Action.READ, Action.CREATE, Action.UPDATE] }
    };
    
    // Verificar si alguno de los permisos del usuario coincide con el recurso y la acción
    for (const permission of user.permissions) {
      const mapping = permissionMap[permission];
      
      if (!mapping) continue;
      
      // Verificar si el permiso aplica al recurso solicitado
      if (mapping.resource !== resource) continue;
      
      // Verificar si el permiso incluye la acción solicitada
      if (!mapping.actions.includes(action) && !mapping.actions.includes(Action.MANAGE)) {
        continue;
      }
      
      // Verificar contexto específico si existe
      if (permission === 'dashboard:office' || permission === 'office:manage') {
        // Para permisos específicos de oficina, verificar que coincida con la oficina del usuario
        if (context?.officeId && user.officeId && context.officeId !== user.officeId) {
          continue;
        }
      }
      
      return true;
    }
    
    return false;
  };

  /**
   * Verifica permisos basados en el rol del usuario
   */
  const checkRoleBasedPermissions = (action: Action, resource: Resource, context?: any): boolean => {
    if (!user) return false;
    
    const { role, officeId } = user;
    
    // Reglas basadas en roles
    switch (role) {
      case UserRole.ADMIN:
        // Administrador puede hacer todo
        return true;
        
      case UserRole.GERENTE_GENERAL:
        // Gerente general puede ver todo
        if (action === Action.READ) return true;
        
        // Puede gestionar reportes y configuraciones
        if ((resource === Resource.REPORTS || resource === Resource.SETTINGS) && 
            (action === Action.CREATE || action === Action.UPDATE)) {
          return true;
        }
        
        // Puede gestionar analítica
        if (resource === Resource.ANALYTICS) return true;
        
        return false;
        
      case UserRole.GERENTE_OFICINA:
        // Gerente de oficina puede ver y gestionar datos de su oficina
        if (resource === Resource.OFFICE) return true;
        
        // Para otros recursos, verificar contexto de oficina
        if (context && context.officeId && officeId) {
          if (context.officeId !== officeId) return false;
          
          // Dentro de su oficina puede leer, crear y actualizar
          if (action === Action.READ || action === Action.CREATE || action === Action.UPDATE) {
            return true;
          }
        }
        
        // Puede leer configuraciones generales
        if (resource === Resource.SETTINGS && action === Action.READ) return true;
        
        return false;
        
      case UserRole.ANALISTA:
        // Analista solo puede ver datos
        if (action !== Action.READ) return false;
        
        // Si tiene oficina asignada, solo ve datos de esa oficina
        if (officeId && context && context.officeId) {
          return context.officeId === officeId;
        }
        
        // Puede leer reportes y configuraciones generales
        return resource === Resource.REPORTS || resource === Resource.SETTINGS;
        
      case UserRole.EDITOR:
        // Editor puede leer y escribir reportes
        if (resource === Resource.REPORTS) {
          return action === Action.READ || action === Action.CREATE || action === Action.UPDATE;
        }
        
        // Puede leer usuarios y configuraciones
        if ((resource === Resource.USERS || resource === Resource.SETTINGS) && action === Action.READ) {
          return true;
        }
        
        return false;
        
      case UserRole.USER:
      default:
        // Usuario básico solo puede leer reportes y configuraciones
        return (resource === Resource.REPORTS || resource === Resource.SETTINGS) && action === Action.READ;
    }
  };

  /**
   * Verifica si un usuario puede realizar una acción específica sobre un dato financiero
   */
  const canAccessFinancialData = (action: Action, data: any): boolean => {
    if (!user) return false;
    
    // Verificar si el dato tiene información de oficina
    const officeId = data.dimensiones?.oficina;
    
    return can(action, Resource.FINANCIAL_DATA, { officeId });
  };

  /**
   * Filtra una lista de datos según los permisos del usuario
   */
  const filterAllowedData = <T extends Record<string, any>>(data: T[]): T[] => {
    if (!user) return [];
    
    return data.filter(item => canAccessFinancialData(Action.READ, item));
  };

  /**
   * Actualiza el estado del usuario y fuerza un re-renderizado
   * @param updatedUser Usuario actualizado
   */
  const updateUserState = (updatedUser: User) => {
    // Actualizar el estado del usuario
    setUser(updatedUser);
    
    // Incrementar la versión del perfil para forzar re-renderizado
    setProfileVersion(prev => prev + 1);
    
    // Actualizar localStorage
    localStorage.setItem('fincoopUser', JSON.stringify(updatedUser));
    
    // Actualizar estado de verificación de email si es necesario
    if (updatedUser.emailVerified !== isEmailVerified) {
      setIsEmailVerified(updatedUser.emailVerified || false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated,
        isLoading,
        error,
        clearError,
        sendEmailVerification,
        verifyEmail,
        isEmailVerified,
        can,
        canAccessFinancialData,
        filterAllowedData,
        updateUserState,
        profileVersion
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Hook para obtener el token de autenticación
export const useAuthToken = (): string | null => {
  const { token } = useAuth();
  return token;
};

// Hook para verificar si un usuario puede realizar una acción específica
export const usePermission = () => {
  const { can } = useAuth();
  return can;
};

// Hook para verificar acceso a datos financieros
export const useFinancialDataAccess = () => {
  const { canAccessFinancialData, filterAllowedData } = useAuth();
  return { canAccessFinancialData, filterAllowedData };
};
