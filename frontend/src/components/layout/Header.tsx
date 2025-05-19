import React from 'react';
import { Bell, Search, HelpCircle, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  toggleNotifications: (state: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleNotifications }) => {
  const { user, logout } = useAuth();
  
  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center space-x-2 text-lg font-semibold text-blue-900">
        Cooperativa de Ahorro y Crédito
      </div>
      
      <div className="hidden md:flex items-center flex-1 max-w-lg mx-auto">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Buscar..."
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <button 
          className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 relative"
          onClick={() => toggleNotifications(true)}
        >
          <Bell size={20} />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        
        <button className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100">
          <HelpCircle size={20} />
        </button>
        
        <div className="relative group">
          <button className="flex items-center space-x-2 focus:outline-none">
            <UserCircle size={28} className="text-blue-800" />
            <span className="hidden md:block text-sm font-medium">{user?.name || 'Usuario'}</span>
          </button>
          
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
            <a href="#perfil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Perfil</a>
            <a href="#configuracion" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Configuración</a>
            <div className="border-t border-gray-100"></div>
            <button
              onClick={logout}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};