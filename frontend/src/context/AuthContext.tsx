import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types/auth";
import { authService } from "../services/authService";

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
