import React from 'react';
import { Calendar, Mail, User as UserIcon, Shield, Clock, RefreshCw } from 'lucide-react';
import { User } from '../../types/auth';

interface ProfileViewProps {
  user: User | null;
  formatDate: (timestamp?: number) => string;
  getRoleName: (role?: string) => string;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, formatDate, getRoleName }) => {
  if (!user) return <div className="py-8 text-center text-gray-500">Cargando información del usuario...</div>;

  return (
    <div className="mt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Columna izquierda: Información personal */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-800">Información personal</h2>
          </div>
          <div className="p-6 space-y-5">
            {/* Nombre completo */}
            {user.displayName && (
              <div className="flex">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-4">
                  <UserIcon size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nombre completo</p>
                  <p className="text-gray-800 font-medium">{user.displayName}</p>
                </div>
              </div>
            )}
            
            {/* Email */}
            <div className="flex">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-4">
                <Mail size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-800 font-medium">{user.email}</p>
              </div>
            </div>
            
            {/* Estado */}
            <div className="flex">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-4">
                <Shield size={16} className="text-blue-600" />
              </div>
              <div className="flex items-center">
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <p className="text-gray-800 font-medium">{user?.disabled ? 'Inactivo' : 'Activo'}</p>
                </div>
                <div className="ml-3 flex items-center">
                  <span className={`h-2 w-2 rounded-full ${user?.disabled ? 'bg-red-500' : 'bg-green-500'} mr-1`}></span>
                  <span className="text-xs text-gray-600">{user?.disabled ? 'Inactivo' : 'En línea'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Columna derecha: Información de cuenta */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="bg-gradient-to-r from-green-50 to-teal-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-800">Información de cuenta</h2>
          </div>
          <div className="p-6 space-y-5">
            {/* Fecha de creación */}
            {user.createdAt && (
              <div className="flex">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-4">
                  <Calendar size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha de registro</p>
                  <p className="text-gray-800 font-medium">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            )}

            {/* Última actualización */}
            {user.updatedAt && (
              <div className="flex">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-4">
                  <Clock size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Última actualización</p>
                  <p className="text-gray-800 font-medium">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            )}
            
            {/* Rol */}
            {user.role && (
              <div className="flex">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-4">
                  <Shield size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rol</p>
                  <p className="text-gray-800 font-medium">{getRoleName(user.role)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botón para recargar datos */}
      <div className="flex justify-end mt-6">
        <button 
          className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          onClick={() => window.location.reload()}
        >
          <RefreshCw size={14} className="mr-2" />
          Actualizar datos
        </button>
      </div>
    </div>
  );
};
