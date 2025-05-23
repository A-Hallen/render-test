/**
 * Página de acceso denegado
 * Se muestra cuando un usuario intenta acceder a una ruta sin permisos
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAutorizacion } from '../context/AutorizacionContext';

export const AccesoDenegado: React.FC = () => {
  const { usuario } = useAutorizacion();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <div className="text-red-600 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Acceso Denegado</h1>
        
        <p className="text-gray-600 mb-6">
          No tienes permisos para acceder a esta sección.
          {usuario && (
            <span> Tu rol actual es <strong>{usuario.rol}</strong>.</span>
          )}
        </p>
        
        <div className="flex flex-col space-y-2">
          <Link 
            to="/" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Volver al Inicio
          </Link>
          
          <button 
            onClick={() => window.history.back()} 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Volver Atrás
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccesoDenegado;
