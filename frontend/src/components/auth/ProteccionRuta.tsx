/**
 * Componente para proteger rutas que requieren autenticaciu00f3n
 * y verificar permisos del usuario
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAutorizacion } from '../../context/AutorizacionContext';
import { Accion } from '../../services/AutorizacionService';

interface ProteccionRutaProps {
  children: React.ReactNode;
  requiereAccion?: Accion;
  requiereSujeto?: string;
  requiereRol?: string[];
}

/**
 * Componente que protege rutas segu00fan autenticaciu00f3n y permisos
 */
export const ProteccionRuta: React.FC<ProteccionRutaProps> = ({
  children,
  requiereAccion,
  requiereSujeto,
  requiereRol
}) => {
  const { usuario, cargando, puede } = useAutorizacion();
  const location = useLocation();
  
  // Si estamos cargando, mostrar un indicador de carga
  if (cargando) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Si no hay usuario autenticado, redirigir al login
  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Verificar rol si es necesario
  if (requiereRol && requiereRol.length > 0) {
    if (!requiereRol.includes(usuario.rol)) {
      return <Navigate to="/acceso-denegado" replace />;
    }
  }
  
  // Verificar permisos si es necesario
  if (requiereAccion && requiereSujeto) {
    if (!puede(requiereAccion, requiereSujeto)) {
      return <Navigate to="/acceso-denegado" replace />;
    }
  }
  
  // Si pasa todas las verificaciones, renderizar los hijos
  return <>{children}</>;
};

export default ProteccionRuta;
