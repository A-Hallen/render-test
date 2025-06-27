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
  ChevronUp,
  PieChart,
  LineChart,
  Wallet,
  BookOpen,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import { useData } from '../../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';

export interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
  isMobile?: boolean;
  setCollapsed?: (state: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleSidebar, isMobile = false, setCollapsed }) => {
  const { user } = useAuth();
  useAuth().profileVersion;
  const { cooperativa } = useData();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    analytics: true,
    operations: false,
    management: false,
    config: false
  });
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Efecto para manejar el estado inicial de los grupos expandidos
  useEffect(() => {
    const path = location.pathname;
    const newState = {...expandedGroups};
    
    // Expandir el grupo relevante según la ruta actual
    if (path.startsWith('/settings')) {
      newState.config = true;
    } else if (path.startsWith('/indicadores') || path === '/analysis') {
      newState.analytics = true;
    } else if (path === '/loans' || path === '/deposits' || path === '/members') {
      newState.operations = true;
    }
    
    setExpandedGroups(newState);
  }, []);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  // Definición de grupos de navegación
  const navGroups = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
      path: '/',
      items: []
    },
    {
      id: 'analytics',
      name: 'Análisis',
      icon: <LineChart size={18} />,
      items: [
        { name: 'Indicadores Financieros', icon: <BarChart2 size={16} />, path: '/indicadores-contables' },
        { name: 'Comparación', icon: <TrendingUp size={16} />, path: '/indicadores-comparacion' },
        { name: 'Informes', icon: <FileText size={16} />, path: '/reports' },
        { name: 'Análisis Avanzado', icon: <PieChart size={16} />, path: '/analysis' },
        { name: 'Visualización 3D', icon: <Box size={16} />, path: '/visualizacion-3d' }
      ]
    },
    {
      id: 'operations',
      name: 'Operaciones',
      icon: <Wallet size={18} />,
      items: [
        { name: 'Préstamos', icon: <CreditCard size={16} />, path: '/loans' },
        { name: 'Depósitos', icon: <Banknote size={16} />, path: '/deposits' },
        { name: 'Miembros', icon: <Users size={16} />, path: '/members' },
        { name: 'Contabilidad', icon: <BookOpen size={16} />, path: '/accounting' }
      ]
    },
    {
      id: 'management',
      name: 'Gestión',
      icon: <Shield size={18} />,
      items: [
        { name: 'Calendario', icon: <Calendar size={16} />, path: '/calendar' },
        { name: 'AI Asistente', icon: <MessageSquare size={16} />, path: '/ai-chat' },
        ...(user?.role === UserRole.ADMIN ? [
          { name: 'Sincronización', icon: <Database size={16} />, path: '/sincronizacion' },
          { name: 'Prueba Notificaciones', icon: <Bell size={16} />, path: '/notifications-test' }
        ] : [])
      ]
    },
    {
      id: 'config',
      name: 'Configuración',
      icon: <Settings size={18} />,
      items: [
        ...(user?.role === UserRole.ADMIN ? [{ name: 'General', icon: <Globe size={16} />, path: '/settings/general' }] : []),
        { name: 'Indicadores', icon: <Calculator size={16} />, path: '/settings/indicadores' },
        { name: 'Dashboard', icon: <LayoutDashboard size={16} />, path: '/settings/dashboard' },
        { name: 'Usuario', icon: <User size={16} />, path: '/settings/user' },
        { name: 'Seguridad', icon: <Lock size={16} />, path: '/settings/security' },
        { name: 'Fuentes de Datos', icon: <Database size={16} />, path: '/settings/dataSource' },
        { name: 'Notificaciones', icon: <Bell size={16} />, path: '/settings/notifications' },
        { name: 'Umbrales', icon: <AlertTriangle size={16} />, path: '/settings/thresholds' },
      ]
    }
  ];

  return (
    <aside 
      ref={sidebarRef}
      className={`bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-64'
      } h-screen flex flex-col shadow-xl`}
    >
      {/* Header del Sidebar */}
      <div className="flex items-center p-4 border-b border-blue-700">
        {!collapsed ? (
          cooperativa?.logo ? (
            <div className="flex-1 flex items-center">
              <img 
                src={cooperativa.logo} 
                alt={cooperativa.nombre || 'Logo de la cooperativa'} 
                className="h-8 max-w-[180px] object-contain transition-opacity hover:opacity-80"
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
                className="h-8 w-8 object-contain transition-opacity hover:opacity-80"
              />
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <Image size={20} />
            </div>
          )
        )}
        <button 
          className="ml-auto text-blue-200 hover:text-white transition-colors"
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {collapsed ? (
            <ChevronRight size={20} className="hover:scale-110 transition-transform" />
          ) : (
            <ChevronLeft size={20} className="hover:scale-110 transition-transform" />
          )}
        </button>
      </div>
      
      {/* Contenido del Sidebar */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-blue-700 scrollbar-track-blue-900">
        <nav className="px-2 space-y-1">
          {navGroups.map((group) => (
            <div key={group.id} className="mb-1">
              {collapsed ? (
                <NavLink
                  to={group.path || (group.items.length > 0 ? group.items[0].path : '/')}
                  className={({ isActive }) => `
                    flex items-center justify-center py-3 px-2 rounded-md transition-all
                    ${isActive ? 'bg-blue-700/50 text-white' : 'text-blue-100 hover:bg-blue-800/50 hover:text-white'}
                    hover:scale-105
                  `}
                  title={group.name}
                >
                  {group.icon}
                </NavLink>
              ) : (
                <>
                  {group.path ? (
                    <NavLink
                      to={group.path}
                      className={({ isActive }) => `
                        w-full flex items-center py-2 px-3 rounded-md transition-all
                        ${isActive 
                          ? 'bg-blue-800/70 text-white' 
                          : 'text-blue-100 hover:bg-blue-800/50 hover:text-white'}
                      `}
                      onClick={() => isMobile && setCollapsed && setCollapsed(true)}
                    >
                      <div className="flex items-center">
                        <span>{group.icon}</span>
                        <span className="ml-3">{group.name}</span>
                      </div>
                    </NavLink>
                  ) : (
                    <button
                      className={`w-full flex items-center justify-between py-2 px-3 rounded-md transition-all
                        ${location.pathname.startsWith(`/${group.id}`) || group.items.some(item => location.pathname === item.path) 
                          ? 'bg-blue-800/70 text-white' 
                          : 'text-blue-100 hover:bg-blue-800/50 hover:text-white'}
                      `}
                      onClick={() => toggleGroup(group.id)}
                    >
                      <div className="flex items-center">
                        <span>{group.icon}</span>
                        <span className="ml-3">{group.name}</span>
                      </div>
                      <motion.span
                        animate={{ rotate: expandedGroups[group.id] ? 0 : 180 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronUp size={16} />
                      </motion.span>
                    </button>
                  )}

                  <AnimatePresence>
                    {expandedGroups[group.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-1 ml-6 space-y-1">
                          {group.items.map((item) => (
                            <NavLink
                              key={item.name}
                              to={item.path}
                              onClick={() => isMobile && setCollapsed && setCollapsed(true)}
                              className={({ isActive }) => `
                                flex items-center py-1.5 px-3 rounded-md transition-all text-sm
                                ${isActive 
                                  ? 'bg-blue-700 text-white font-medium' 
                                  : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'}
                                hover:translate-x-1
                              `}
                            >
                              <span>{item.icon}</span>
                              <span className="ml-2">{item.name}</span>
                            </NavLink>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          ))}
        </nav>
      </div>
      
      {/* Footer del Sidebar */}
      <div className="p-3 border-t border-blue-700 mt-auto">
        <div className={`flex ${collapsed ? 'justify-center' : 'justify-center'} items-center`}>
          {collapsed ? (
            <div className="text-blue-300 text-xs font-light italic">A</div>
          ) : (
            <motion.div 
              className="text-blue-300 text-xs font-light flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <span className="mr-1">powered by</span>
              <span className="font-semibold text-white">Angia</span>
            </motion.div>
          )}
        </div>
      </div>
    </aside>
  );
};