import React from 'react';
import { XCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  children: React.ReactNode;
  type: AlertType;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  type,
  onClose,
  className = ''
}) => {
  const typeClasses = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200'
  };
  
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
  };
  
  return (
    <div className={`flex items-start p-4 rounded-md border ${typeClasses[type]} ${className}`}>
      <div className="flex-shrink-0 mr-3">
        {icons[type]}
      </div>
      <div className="flex-grow">
        {children}
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          className="flex-shrink-0 ml-3 -mt-1 -mr-1 p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
