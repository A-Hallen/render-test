import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, CheckCircle, Mail, Loader2 } from 'lucide-react';

interface EmailVerificationAlertProps {
  className?: string;
}

export const EmailVerificationAlert: React.FC<EmailVerificationAlertProps> = ({ className = '' }) => {
  const { user, isEmailVerified, sendEmailVerification, isLoading, error } = useAuth();
  const [emailSent, setEmailSent] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

  // Si el email ya está verificado o no hay usuario, no mostrar nada
  if (isEmailVerified || !user) {
    return null;
  }

  // Si el usuario decidió ocultar la alerta, no mostrar nada
  if (!showAlert) {
    return null;
  }

  const handleSendVerificationEmail = async () => {
    try {
      await sendEmailVerification(user.email);
      setEmailSent(true);
      
      // Después de 5 segundos, resetear el estado para permitir reenviar
      setTimeout(() => {
        setEmailSent(false);
      }, 5000);
    } catch (error) {
      console.error('Error al enviar email de verificación:', error);
    }
  };

  return (
    <div className={`bg-yellow-50 border-l-4 border-yellow-400 p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between items-center">
          <p className="text-sm text-yellow-700">
            Tu dirección de email no está verificada. Verifica tu email para acceder a todas las funcionalidades.
          </p>
          <div className="mt-3 md:mt-0 md:ml-6 flex items-center">
            {isLoading ? (
              <button
                disabled
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-yellow-600 opacity-75 cursor-not-allowed"
              >
                <Loader2 className="animate-spin -ml-0.5 mr-2 h-4 w-4" />
                Enviando...
              </button>
            ) : emailSent ? (
              <span className="inline-flex items-center px-3 py-1 text-sm leading-5 font-medium text-green-700">
                <CheckCircle className="-ml-0.5 mr-2 h-4 w-4" />
                Email enviado
              </span>
            ) : (
              <button
                onClick={handleSendVerificationEmail}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-500 focus:outline-none focus:border-yellow-700 focus:shadow-outline-yellow active:bg-yellow-700 transition ease-in-out duration-150"
              >
                <Mail className="-ml-0.5 mr-2 h-4 w-4" />
                Reenviar verificación
              </button>
            )}
            <button 
              onClick={() => setShowAlert(false)}
              className="ml-2 text-sm text-gray-500 hover:text-gray-700"
              aria-label="Cerrar alerta"
            >
              ×
            </button>
          </div>
        </div>
      </div>
      {error && (
        <div className="mt-2 text-sm text-red-600">
          Error: {error}
        </div>
      )}
    </div>
  );
};
