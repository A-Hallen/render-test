import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Settings, 
  Calendar, 
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Database,
  BarChart2,
  Users,
  CreditCard,
  Banknote,
  Box,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';

export interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
  // Add optional prop for mobile view handling
  isMobile?: boolean;
  setCollapsed?: (state: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleSidebar, isMobile = false, setCollapsed }) => {
  // Usar user y acceder a profileVersion para forzar re-renderizado cuando cambia la imagen
  const { user } = useAuth();
  // Acceder a profileVersion para asegurar que el componente se re-renderice
  useAuth().profileVersion;

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Análisis', icon: <TrendingUp size={20} />, path: '/analysis' },
    { name: 'Indicadores Contables', icon: <BarChart2 size={20} />, path: '/indicadores-contables' },
    { name: 'Préstamos', icon: <CreditCard size={20} />, path: '/loans' },
    { name: 'Miembros', icon: <Users size={20} />, path: '/members' },
    { name: 'Depósitos', icon: <Banknote size={20} />, path: '/deposits' },
    { name: 'Visualización 3D', icon: <Box size={20} />, path: '/visualizacion-3d' },
    { name: 'AI Asistente', icon: <MessageSquare size={20} />, path: '/ai-chat' },
    { name: 'Informes', icon: <FileText size={20} />, path: '/reports' },
    { name: 'Calendario', icon: <Calendar size={20} />, path: '/calendar' },
    // Mostrar enlace de sincronización solo para administradores
    ...(user?.role === UserRole.ADMIN ? [{ name: 'Sincronización', icon: <Database size={20} />, path: '/sincronizacion' }] : []),
    // Añadir enlace a la página de prueba de notificaciones
    ...(user?.role === UserRole.ADMIN ? [{ name: 'Prueba Notificaciones', icon: <Bell size={20} />, path: '/notifications-test' }] : []),
    { name: 'Configuración', icon: <Settings size={20} />, path: '/settings' },
  ];
  
  return (
    <aside 
      className={`bg-blue-900 text-white transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-64'
      } h-screen flex flex-col`}
    >
      <div className="flex items-center p-4 border-b border-blue-800">
        {!collapsed && <h1 className="text-xl font-semibold">FinCoop AI</h1>}
        <button 
          className="ml-auto text-blue-200 hover:text-white"
          onClick={toggleSidebar}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => {
                // Close sidebar on mobile when a link is clicked
                if (isMobile && setCollapsed) {
                  setCollapsed(true);
                }
              }}
              className={({ isActive }) => `
                flex items-center py-2 px-3 rounded-md transition duration-150 ease-in-out
                ${isActive 
                  ? 'bg-blue-800 text-white' 
                  : 'text-blue-100 hover:bg-blue-800 hover:text-white'}
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <span>{item.icon}</span>
              {!collapsed && <span className="ml-3">{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </div>
      
      {!collapsed && (
        <div className="p-4 border-t border-blue-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'Usuario'} 
                  className="h-8 w-8 rounded-full border border-blue-600 object-cover" 
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-700 flex items-center justify-center">
                  {user?.displayName?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium truncate max-w-[160px]">{user?.displayName || 'Usuario'}</p>
              <div className="flex items-center">
                <span className="text-xs text-blue-300">
                  {user?.role === UserRole.ADMIN ? 'Administrador' : 
                   user?.role === UserRole.EDITOR ? 'Editor' : 'Usuario'}
                </span>
                {user?.emailVerified ? (
                  <span className="ml-1.5 text-xs bg-blue-800 text-blue-200 px-1 rounded-sm">
                    Verificado
                  </span>
                ) : (
                  <span className="ml-1.5 text-xs bg-red-900 text-red-200 px-1 rounded-sm flex items-center">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-0.5 animate-pulse"></span>
                    No verificado
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};  
