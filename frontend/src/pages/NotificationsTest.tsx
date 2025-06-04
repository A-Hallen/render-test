import React from 'react';
import { NotificationTester } from '../components/notifications/test/NotificationTester';

/**
 * Página para probar las notificaciones
 * Esta página contiene el componente NotificationTester y documentación sobre
 * cómo funciona el sistema de notificaciones
 */
export const NotificationsTest: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Prueba de Notificaciones</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <NotificationTester />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Documentación</h2>
          
          <div className="prose max-w-none">
            <h3>Cómo funciona el sistema de notificaciones</h3>
            <p>
              El sistema de notificaciones está integrado con Firebase Cloud Messaging (FCM) para permitir
              notificaciones push en tiempo real, incluso cuando la aplicación está en segundo plano.
            </p>
            
            <h4>Tipos de notificaciones</h4>
            <ul>
              <li><strong>Primer plano:</strong> Cuando la aplicación está abierta y activa, las notificaciones se muestran como toasts dentro de la aplicación.</li>
              <li><strong>Segundo plano:</strong> Cuando la aplicación está minimizada o cerrada, las notificaciones se muestran como notificaciones nativas del sistema.</li>
            </ul>
            
            <h4>Flujo de trabajo</h4>
            <ol>
              <li>El usuario concede permiso para recibir notificaciones.</li>
              <li>La aplicación obtiene un token FCM único para el dispositivo/navegador.</li>
              <li>Este token se puede enviar al backend para asociarlo con el usuario.</li>
              <li>El backend puede enviar notificaciones a dispositivos específicos usando estos tokens.</li>
            </ol>
            
            <h3>Cómo enviar notificaciones desde el backend</h3>
            <p>
              Para enviar una notificación desde el backend a un dispositivo específico, necesitas:
            </p>
            
            <ol>
              <li>El token FCM del dispositivo (visible en el probador de notificaciones).</li>
              <li>Usar el Firebase Admin SDK en el backend para enviar mensajes.</li>
            </ol>
            
            <h4>Ejemplo de código para el backend (Node.js)</h4>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
{`// Importar Firebase Admin SDK
const admin = require('firebase-admin');

// Inicializar la app (esto normalmente se hace una vez en la inicialización)
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

// Función para enviar una notificación
async function enviarNotificacion(token, titulo, cuerpo, tipo = 'info', datos = {}) {
  try {
    const mensaje = {
      notification: {
        title: titulo,
        body: cuerpo,
      },
      data: {
        type: tipo,
        ...datos,
      },
      token: token,
    };

    const respuesta = await admin.messaging().send(mensaje);
    console.log('Notificación enviada correctamente:', respuesta);
    return respuesta;
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    throw error;
  }
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
