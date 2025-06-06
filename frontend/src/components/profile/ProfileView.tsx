import React from 'react';
import { Mail, Calendar, Shield, RefreshCw, User as UserIcon } from 'lucide-react';
import { User } from '../../types/auth';

interface ProfileViewProps {
  user: User | null;
  formatDate: (timestamp?: number) => string;
  getRoleName: (role?: string) => string;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, formatDate, getRoleName }) => {
  return (
    <div className="px-6 py-4">
      {/* Tarjetas de información en una disposición más compacta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tarjeta de correo electrónico */}
        <div className="flex items-center bg-gray-50 p-3 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <Mail size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Correo electrónico</p>
            <p className="text-sm text-gray-800">{user?.email}</p>
          </div>
        </div>

        {/* Tarjeta de rol */}
        <div className="flex items-center bg-gray-50 p-3 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
            <Shield size={16} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Rol</p>
            <p className="text-sm text-gray-800">{user?.role ? getRoleName(user.role) : 'No definido'}</p>
          </div>
        </div>

        {/* Tarjeta de fecha de registro */}
        <div className="flex items-center bg-gray-50 p-3 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
            <Calendar size={16} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Fecha de registro</p>
            <p className="text-sm text-gray-800">{user?.createdAt ? formatDate(user.createdAt) : 'No disponible'}</p>
          </div>
        </div>

        {/* Tarjeta de estado */}
        <div className="flex items-center bg-gray-50 p-3 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
            <UserIcon size={16} className="text-amber-600" />
          </div>
          <div className="flex items-center">
            <div>
              <p className="text-xs text-gray-500 font-medium">Estado</p>
              <p className="text-sm text-gray-800">{user?.disabled ? 'Inactivo' : 'Activo'}</p>
            </div>
            <div className="ml-3 flex items-center">
              <span className={`h-2 w-2 rounded-full ${user?.disabled ? 'bg-red-500' : 'bg-green-500'} mr-1`}></span>
              <span className="text-xs text-gray-600 font-medium">{user?.disabled ? 'Inactivo' : 'En línea'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Botón para recargar datos */}
      <div className="flex justify-end mt-4">
        <button 
          className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          onClick={() => window.location.reload()}
        >
          <RefreshCw size={14} className="mr-1.5" />
          Actualizar
        </button>
      </div>
    </div>
  );
};
