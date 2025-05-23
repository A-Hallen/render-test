/**
 * Contexto de autorizaciu00f3n para gestionar el estado del usuario y los permisos
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { autorizacionService, Usuario, Rol, Accion } from '../services/AutorizacionService';

// Definir la interfaz del contexto
interface ContextoAutorizacion {
  usuario: Usuario | null;
  cargando: boolean;
  error: string | null;
  iniciarSesion: (email: string, password: string) => Promise<void>;
  cerrarSesion: () => void;
  puede: (accion: Accion, sujeto: any) => boolean;
}

// Crear el contexto
const AutorizacionContext = createContext<ContextoAutorizacion | undefined>(undefined);

// Proveedor del contexto
export const AutorizacionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Verificar si hay un usuario en localStorage al cargar
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      try {
        const usuarioParsed = JSON.parse(usuarioGuardado) as Usuario;
        setUsuario(usuarioParsed);
        autorizacionService.setUsuario(usuarioParsed);
      } catch (err) {
        console.error('Error al parsear usuario guardado:', err);
        localStorage.removeItem('usuario');
      }
    }
    setCargando(false);
  }, []);
  
  // Funciun para iniciar sesiun
  const iniciarSesion = async (email: string, password: string) => {
    setCargando(true);
    setError(null);
    
    try {
      // En un caso real, aquu se harun una llamada a la API
      // Para esta demo, simulamos la autenticaciun
      
      // Simular un retraso de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar credenciales (simulado)
      if (email === 'admin@ejemplo.com' && password === 'admin123') {
        const usuarioAdmin: Usuario = {
          id: '1',
          nombre: 'Administrador',
          email: 'admin@ejemplo.com',
          rol: Rol.ADMINISTRADOR
        };
        setUsuario(usuarioAdmin);
        autorizacionService.setUsuario(usuarioAdmin);
        localStorage.setItem('usuario', JSON.stringify(usuarioAdmin));
      } else if (email === 'gerente@ejemplo.com' && password === 'gerente123') {
        const usuarioGerente: Usuario = {
          id: '2',
          nombre: 'Gerente General',
          email: 'gerente@ejemplo.com',
          rol: Rol.GERENTE_GENERAL
        };
        setUsuario(usuarioGerente);
        autorizacionService.setUsuario(usuarioGerente);
        localStorage.setItem('usuario', JSON.stringify(usuarioGerente));
      } else if (email === 'oficina@ejemplo.com' && password === 'oficina123') {
        const usuarioOficina: Usuario = {
          id: '3',
          nombre: 'Gerente Oficina',
          email: 'oficina@ejemplo.com',
          rol: Rol.GERENTE_OFICINA,
          oficinaId: '001'
        };
        setUsuario(usuarioOficina);
        autorizacionService.setUsuario(usuarioOficina);
        localStorage.setItem('usuario', JSON.stringify(usuarioOficina));
      } else if (email === 'analista@ejemplo.com' && password === 'analista123') {
        const usuarioAnalista: Usuario = {
          id: '4',
          nombre: 'Analista',
          email: 'analista@ejemplo.com',
          rol: Rol.ANALISTA,
          oficinaId: '001'
        };
        setUsuario(usuarioAnalista);
        autorizacionService.setUsuario(usuarioAnalista);
        localStorage.setItem('usuario', JSON.stringify(usuarioAnalista));
      } else {
        throw new Error('Credenciales incorrectas');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error desconocido al iniciar sesión');
      }
    } finally {
      setCargando(false);
    }
  };
  
  // Funciun para cerrar sesiun
  const cerrarSesion = () => {
    setUsuario(null);
    autorizacionService.setUsuario(null);
    localStorage.removeItem('usuario');
  };
  
  // Función para verificar permisos
  const puede = (accion: Accion, sujeto: any): boolean => {
    return autorizacionService.puede(accion, sujeto);
  };
  
  // Valor del contexto
  const valor: ContextoAutorizacion = {
    usuario,
    cargando,
    error,
    iniciarSesion,
    cerrarSesion,
    puede
  };
  
  return (
    <AutorizacionContext.Provider value={valor}>
      {children}
    </AutorizacionContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAutorizacion = (): ContextoAutorizacion => {
  const context = useContext(AutorizacionContext);
  if (context === undefined) {
    throw new Error('useAutorizacion debe usarse dentro de un AutorizacionProvider');
  }
  return context;
};
