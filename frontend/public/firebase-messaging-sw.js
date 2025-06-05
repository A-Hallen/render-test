// Firebase Cloud Messaging Service Worker

importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

// Configuración de Firebase - debe coincidir con la configuración en firebaseConfig.ts
firebase.initializeApp({
  apiKey: 'VITE_FIREBASE_API_KEY',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
  projectId: 'VITE_FIREBASE_PROJECT_ID',
  storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'VITE_FIREBASE_APP_ID'
});

const messaging = firebase.messaging();

// Manejo de mensajes en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Recibido mensaje en segundo plano:', payload);
  
  const { notification, data } = payload;
  
  if (notification) {
    // Mostrar notificación nativa del sistema
    const notificationTitle = notification.title || 'Nueva notificación';
    const notificationOptions = {
      body: notification.body || '',
      icon: '/logo192.png', // Asegúrate de que este archivo exista en la carpeta public
      badge: '/badge-icon.png', // Opcional: icono para dispositivos móviles
      data: data || {},
      tag: data?.id || Date.now().toString(), // Usar un tag para agrupar notificaciones
      actions: [
        {
          action: 'view',
          title: 'Ver'
        }
      ],
      // Esto asegura que la notificación se muestre incluso si la app está en segundo plano
      requireInteraction: true
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});

// Manejar clic en la notificación
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notificación clickeada', event);
  
  // Cerrar la notificación
  event.notification.close();
  
  // Obtener los datos de la notificación
  const notificationData = event.notification.data || {};
  
  // URL base para abrir
  const urlToOpen = new URL('/', self.location.origin).href;
  
  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  })
  .then((windowClients) => {
    let existingClient = null;
    
    // Buscar cualquier ventana abierta de la aplicación
    for (let i = 0; i < windowClients.length; i++) {
      const client = windowClients[i];
      // Verificar si la URL pertenece a nuestro origen
      if (client.url.startsWith(self.location.origin)) {
        existingClient = client;
        break;
      }
    }
    
    // Si encontramos una ventana existente
    if (existingClient) {
      // Primero enfocamos la ventana
      return existingClient.focus().then((focusedClient) => {
        // Luego enviamos un mensaje a la aplicación principal para actualizar las notificaciones
        return focusedClient.postMessage({
          type: 'NOTIFICATION_CLICKED',
          payload: {
            notificationId: notificationData.id,
            timestamp: Date.now(),
            data: notificationData
          }
        });
      });
    }
    
    // Si no hay ventana abierta, abrir una nueva
    if (clients.openWindow) {
      return clients.openWindow(urlToOpen).then(client => {
        if (client) {
          // Esperar un momento para que la aplicación se inicialice
          setTimeout(() => {
            client.postMessage({
              type: 'NOTIFICATION_CLICKED',
              payload: {
                notificationId: notificationData.id,
                timestamp: Date.now(),
                data: notificationData
              }
            });
          }, 1500);
        }
      });
    }
  });
  
  event.waitUntil(promiseChain);
});

// Escuchar mensajes de la aplicación principal
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_PENDING_NOTIFICATIONS') {
    // Aquí podríamos verificar si hay notificaciones pendientes
    // y enviarlas a la aplicación principal
    console.log('[Service Worker] Verificando notificaciones pendientes');
  }
});
