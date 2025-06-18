import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  Image,
  Globe,
  User,
  Lock,
  Calculator,
  AlertTriangle,
  ChevronDown,
  ChevronUp
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
  // Estado para controlar la expansión del menú de configuración
  const [configExpanded, setConfigExpanded] = useState(false);
  // Obtener la ruta actual para resaltar el elemento activo
  const location = useLocation();
  // Referencia al contenedor del submenú para hacer scroll
  const configButtonRef = useRef<HTMLButtonElement>(null);
  
  // Efecto para hacer scroll cuando se expande el menú de configuración
  useEffect(() => {
    if (configExpanded && configButtonRef.current) {
      // Pequeño timeout para asegurar que la animación comience antes del scroll
      setTimeout(() => {
        configButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [configExpanded]);
  
  // Definir los elementos de configuración
  const configItems = [
    ...(user?.role === UserRole.ADMIN ? [{ name: 'General', icon: <Globe size={18} />, path: '/settings/general' }] : []),
    { name: 'Indicadores', icon: <Calculator size={18} />, path: '/settings/indicadores' },
    { name: 'Usuario', icon: <User size={18} />, path: '/settings/user' },
    { name: 'Seguridad', icon: <Lock size={18} />, path: '/settings/security' },
    { name: 'Fuentes de Datos', icon: <Database size={18} />, path: '/settings/dataSource' },
    { name: 'Notificaciones', icon: <Bell size={18} />, path: '/settings/notifications' },
    { name: 'Umbrales', icon: <AlertTriangle size={18} />, path: '/settings/thresholds' },
  ];

  // Verificar si alguna ruta de configuración está activa
  const isConfigActive = location.pathname.startsWith('/settings');

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
          
          {/* Configuración con submenú */}
          <div className="relative">
            <button
              ref={configButtonRef}
              className={`w-full flex items-center py-2 px-3 rounded-md transition duration-150 ease-in-out
                ${isConfigActive
                  ? 'bg-blue-800 text-white' 
                  : 'text-blue-100 hover:bg-blue-800 hover:text-white'}
                ${collapsed ? 'justify-center' : 'justify-between'}
              `}
              onClick={() => {
                if (!collapsed) {
                  setConfigExpanded(!configExpanded);
                } else if (isMobile && setCollapsed) {
                  // Si está colapsado, expandir el sidebar primero
                  setCollapsed(false);
                }
              }}
            >
              <div className="flex items-center">
                <span><Settings size={20} /></span>
                {!collapsed && <span className="ml-3">Configuración</span>}
              </div>
              {!collapsed && (
                <span>
                  {configExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              )}
            </button>
            
            {/* Submenú de configuración con animación */}
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${!collapsed ? 'max-h-96' : 'max-h-0'} ${configExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
              {!collapsed && (
              <div className="mt-1 ml-6 space-y-1">
                {configItems.map((item) => (
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
                      flex items-center py-1.5 px-3 rounded-md transition duration-150 ease-in-out text-sm
                      ${isActive 
                        ? 'bg-blue-700 text-white' 
                        : 'text-blue-100 hover:bg-blue-700 hover:text-white'}
                    `}
                  >
                    <span>{item.icon}</span>
                    <span className="ml-2">{item.name}</span>
                  </NavLink>
                ))}
              </div>
            )}
            </div>
          </div>
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
