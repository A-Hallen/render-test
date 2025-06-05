import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, AlertCircle, Loader2, ShieldCheck, BarChart2, Users, CreditCard, ChevronRight, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  
  const { login, isAuthenticated, isLoading, error: authError, clearError } = useAuth();

  // Efecto para verificar autenticación inicial y marcar cuando la verificación está completa
  useEffect(() => {
    // Marcar la verificación inicial como completada después de que isAuthenticated se haya establecido
    setInitialCheckDone(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);
    
    if (!email) {
      setValidationError('El email es requerido');
      return;
    }
    
    if (!password) {
      setValidationError('La contraseña es requerida');
      return;
    }

    try {
      await login(email, password);
    } catch (error) {
      console.error(error);
    }
  };

  // Si el usuario ya está autenticado, redirigir inmediatamente a la página principal
  if (initialCheckDone && isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // Mostrar pantalla de carga mientras se verifica la autenticación inicial
  if (!initialCheckDone) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Verificando sesión...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Panel izquierdo - Información de la plataforma */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-800 to-indigo-900 p-12 flex-col justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
            <img src="images/icon.svg" alt="FinCoop AI" className="w-10 h-10" />
          </div>
          <span className="text-white font-semibold text-xl">FinCoop AI</span>
        </div>
        
        <div className="max-w-md">
          <h1 className="text-4xl font-bold text-white mb-6">Potencia tu gestión financiera</h1>
          <p className="text-blue-100 text-lg mb-8">
            La plataforma inteligente para cooperativas financieras que combina análisis avanzado 
            con simplicidad de uso. Toma decisiones basadas en datos en tiempo real.
          </p>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <BarChart2 className="h-6 w-6 text-blue-300 mt-0.5" />
              <div>
                <h3 className="text-white font-medium">Analítica avanzada</h3>
                <p className="text-blue-200 text-sm">Métricas en tiempo real</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <ShieldCheck className="h-6 w-6 text-blue-300 mt-0.5" />
              <div>
                <h3 className="text-white font-medium">Seguridad bancaria</h3>
                <p className="text-blue-200 text-sm">Protección de nivel enterprise</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Users className="h-6 w-6 text-blue-300 mt-0.5" />
              <div>
                <h3 className="text-white font-medium">Gestión de socios</h3>
                <p className="text-blue-200 text-sm">Todo en un solo lugar</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CreditCard className="h-6 w-6 text-blue-300 mt-0.5" />
              <div>
                <h3 className="text-white font-medium">Operaciones</h3>
                <p className="text-blue-200 text-sm">Flujo completo integrado</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-blue-300 text-sm">
          &copy; {new Date().getFullYear()} FinCoop AI. Todos los derechos reservados.
        </div>
      </div>

      {/* Panel derecho - Formulario de login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-md w-full">
          <div className="text-center lg:hidden mb-8">
            <div className="flex justify-center items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-blue-200 shadow-lg">
                <img src="/logo.svg" alt="FinCoop AI" className="w-8 h-8" />
              </div>
              <span className="text-gray-800 font-semibold text-xl">FinCoop AI</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Accede a tu cuenta</h2>
          </div>
          
          <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100 backdrop-blur-sm bg-opacity-80">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2 hidden lg:block">Bienvenido de vuelta</h2>
              <p className="text-gray-500 hidden lg:block">Ingresa tus credenciales para acceder al sistema</p>
            </div>
            
            {(validationError || authError) && (
              <div className="mb-6 bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl flex items-start gap-3 shadow-sm">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-red-500" />
                <span className="text-sm">{validationError || authError}</span>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-500 transition-colors">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white shadow-sm"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-500 transition-colors">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-md shadow-sm"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 select-none">
                    Mantener sesión
                  </label>
                </div>

                <a 
                  href="#recovery" 
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-4 px-6 mt-8 border border-transparent rounded-xl shadow-lg text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all group relative overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity"></span>
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    <span>Verificando credenciales...</span>
                  </>
                ) : (
                  <>
                    <span>Acceder al sistema</span>
                    <ArrowRight className="h-5 w-5 ml-3 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500">
              ¿Nuevo en la plataforma?{' '}
              <a href="#contact" className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition-all">
                Contacta al administrador
              </a>
            </div>
          </div>

          <div className="mt-10 text-center">
            <div className="inline-flex items-center justify-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <p className="text-xs font-medium text-gray-600">Sistema en línea y operativo</p>
            </div>
            <div className="mt-4 text-xs text-gray-400">
              <p>&copy; {new Date().getFullYear()} FinCoop AI. Sistema de gestión financiera v2.4</p>
              <p className="mt-1">Cumplimiento PCI DSS Nivel 1 | ISO 27001 Certified</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};