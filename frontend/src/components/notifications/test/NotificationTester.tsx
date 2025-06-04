import React, { useState } from 'react';
import { useNotification } from '../../../context/NotificationContext';

/**
 * Componente para probar las notificaciones
 * Este componente permite simular el envío de notificaciones desde el frontend
 * para probar la integración con Firebase Cloud Messaging
 */
export const NotificationTester: React.FC = () => {
  const { addNotification, requestNotificationPermission, notificationsEnabled, fcmToken } = useNotification();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [showToken, setShowToken] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && message) {
      addNotification({
        title,
        body: message,
        type,
      });
      // Limpiar el formulario después de enviar
      setTitle('');
      setMessage('');
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Probador de Notificaciones</h2>
      
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <div className={`w-3 h-3 rounded-full mr-2 ${notificationsEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>Estado de notificaciones: {notificationsEnabled ? 'Activadas' : 'Desactivadas'}</span>
        </div>
        
        {!notificationsEnabled && (
          <button 
            onClick={() => requestNotificationPermission()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Activar notificaciones
          </button>
        )}
        
        {fcmToken && (
          <div className="mt-2">
            <button 
              onClick={() => setShowToken(!showToken)} 
              className="text-sm text-blue-600 hover:underline"
            >
              {showToken ? 'Ocultar token FCM' : 'Mostrar token FCM'}
            </button>
            {showToken && (
              <div className="mt-1 p-2 bg-gray-100 rounded text-xs break-all">
                <p className="font-mono">{fcmToken}</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Título
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Mensaje
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          ></textarea>
        </div>
        
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Tipo
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as 'info' | 'success' | 'warning' | 'error')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="info">Información</option>
            <option value="success">Éxito</option>
            <option value="warning">Advertencia</option>
            <option value="error">Error</option>
          </select>
        </div>
        
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Enviar notificación
        </button>
      </form>
      
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Información para el backend</h3>
        <div className="bg-gray-100 p-3 rounded-md">
          <p className="text-xs text-gray-600 mb-2">Para enviar una notificación desde el backend a este dispositivo, usa el siguiente token FCM:</p>
          {fcmToken ? (
            <code className="text-xs font-mono break-all">{fcmToken}</code>
          ) : (
            <p className="text-xs text-red-500">No hay token FCM disponible. Activa las notificaciones primero.</p>
          )}
        </div>
      </div>
    </div>
  );
};
