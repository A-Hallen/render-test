import React from 'react';
import { Bell, Search, HelpCircle, UserCircle, User, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import { EmailVerificationAlert } from '../auth/EmailVerificationAlert';

interface HeaderProps {
  toggleNotifications: (state: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleNotifications }) => {
  const { user, logout, sendEmailVerification, isEmailVerified } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [verificationMessage, setVerificationMessage] = React.useState<{text: string, type: 'success' | 'error'} | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  
  // Función para solicitar la verificación de email
  const requestEmailVerification = async () => {
    if (!user || !user.email || isEmailVerified) return;
    
    setIsVerifying(true);
    setVerificationMessage(null);
    
    try {
      // Usar el método real de verificación de email
      await sendEmailVerification(user.email);
      
      setVerificationMessage({
        text: 'Se ha enviado un correo de verificación a tu email',
        type: 'success'
      });
    } catch (error: any) {
      setVerificationMessage({
        text: error.message || 'Error al enviar el correo de verificación',
        type: 'error'
      });
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Manejar clics fuera del menú para cerrarlo
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <>
      {user && !isEmailVerified && <EmailVerificationAlert className="mb-0" />}
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
        
        <div className="relative" ref={menuRef}>
          <button 
            className="flex items-center space-x-2 focus:outline-none p-1.5 rounded-full hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'Usuario'} 
                className="h-7 w-7 rounded-full border border-gray-200" 
              />
            ) : (
              <UserCircle size={28} className="text-blue-800" />
            )}
            <span className="hidden md:block text-sm font-medium">
              {user?.displayName || 'Usuario'}
            </span>
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
            {user && (
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                <div className="mt-1 flex items-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {user.role === UserRole.ADMIN ? 'Administrador' : 
                     user.role === UserRole.EDITOR ? 'Editor' : 'Usuario'}
                  </span>
                  {isEmailVerified ? (
                    <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Verificado
                    </span>
                  ) : (
                    <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 group-hover:bg-red-200 cursor-pointer" title="Haz clic para verificar tu email">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1 animate-pulse"></span>
                      No verificado
                    </span>
                  )}
                </div>
              </div>
            )}
            {/* Mensaje de verificación de email */}
            {verificationMessage && (
              <div className={`px-4 py-2 text-xs ${verificationMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {verificationMessage.text}
              </div>
            )}
            
            {/* Opción de verificación de email si no está verificado */}
            {user && !isEmailVerified && (
              <button 
                onClick={requestEmailVerification}
                disabled={isVerifying}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 border-b border-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {isVerifying ? 'Enviando...' : 'Verificar mi email'}
              </button>
            )}
            
            <a href="#perfil" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <User size={16} className="mr-2" />
              Perfil
            </a>
            <a href="#configuracion" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <Shield size={16} className="mr-2" />
              Configuración
            </a>
            <div className="border-t border-gray-100"></div>
            <button
              onClick={logout}
              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          </div>
          )}
        </div>
      </div>
    </header>
    </>
  );
};