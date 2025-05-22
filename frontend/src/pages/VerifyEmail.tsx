import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export const VerifyEmail: React.FC = () => {
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { verifyEmail, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyEmailWithCode = async () => {
      try {
        // Obtener el código de verificación de la URL
        const searchParams = new URLSearchParams(location.search);
        const oobCode = searchParams.get('oobCode');

        if (!oobCode) {
          setVerificationStatus('error');
          setErrorMessage('No se encontró código de verificación en la URL');
          return;
        }

        // Intentar verificar el email con el código
        const success = await verifyEmail(oobCode);
        
        if (success) {
          setVerificationStatus('success');
        } else {
          setVerificationStatus('error');
          setErrorMessage('No se pudo verificar el email. El código puede ser inválido o haber expirado.');
        }
      } catch (error: any) {
        setVerificationStatus('error');
        setErrorMessage(error.message || 'Error al verificar el email');
        console.error('Error en verificación de email:', error);
      }
    };

    verifyEmailWithCode();
  }, [location.search, verifyEmail]);

  const handleRedirect = () => {
    // Redirigir al dashboard si está autenticado, o al login si no
    navigate(isAuthenticated ? '/' : '/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verificación de Email
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {verificationStatus === 'verifying' && (
              <div className="flex flex-col items-center justify-center py-6">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-700">Verificando tu dirección de email...</p>
              </div>
            )}

            {verificationStatus === 'success' && (
              <div className="flex flex-col items-center justify-center py-6">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">¡Email verificado correctamente!</h3>
                <p className="text-gray-600 mb-6">Tu dirección de email ha sido verificada exitosamente.</p>
                <button
                  onClick={handleRedirect}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isAuthenticated ? 'Ir al Dashboard' : 'Iniciar sesión'}
                </button>
              </div>
            )}

            {verificationStatus === 'error' && (
              <div className="flex flex-col items-center justify-center py-6">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error en la verificación</h3>
                <p className="text-gray-600 mb-6">{errorMessage}</p>
                <button
                  onClick={handleRedirect}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isAuthenticated ? 'Ir al Dashboard' : 'Iniciar sesión'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
