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
  Bell,
  Image
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import { useData } from '../../context/DataContext';

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
  // Obtener datos de la cooperativa para mostrar el logo
  const { cooperativa } = useData();

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Indicadores Contables', icon: <BarChart2 size={20} />, path: '/indicadores-contables' },
    { name: 'Informes', icon: <FileText size={20} />, path: '/reports' },
    { name: 'Análisis', icon: <TrendingUp size={20} />, path: '/analysis' },
    { name: 'Préstamos', icon: <CreditCard size={20} />, path: '/loans' },
    { name: 'Miembros', icon: <Users size={20} />, path: '/members' },
    { name: 'Depósitos', icon: <Banknote size={20} />, path: '/deposits' },
    { name: 'Visualización 3D', icon: <Box size={20} />, path: '/visualizacion-3d' },
    { name: 'AI Asistente', icon: <MessageSquare size={20} />, path: '/ai-chat' },
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
        {!collapsed ? (
          cooperativa?.logo ? (
            <div className="flex-1 flex items-center">
              <img 
                src={cooperativa.logo} 
                alt={cooperativa.nombre || 'Logo de la cooperativa'} 
                className="h-8 max-w-[180px] object-contain"
              />
            </div>
          ) : (
            <h1 className="text-xl font-semibold">FinCoop AI</h1>
          )
        ) : (
          cooperativa?.logo ? (
            <div className="w-full flex justify-center">
              <img 
                src={cooperativa.logo} 
                alt="Logo" 
                className="h-8 w-8 object-contain"
              />
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <Image size={20} />
            </div>
          )
        )}
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
      
      <div className="p-3 border-t border-blue-800 mt-auto">
        <div className={`flex ${collapsed ? 'justify-center' : 'justify-center'} items-center`}>
          {collapsed ? (
            <div className="text-blue-300 text-xs font-light italic">A</div>
          ) : (
            <div className="text-blue-300 text-xs font-light flex items-center">
              <span className="mr-1">powered by</span>
              <span className="font-semibold text-white">Angia</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};  
