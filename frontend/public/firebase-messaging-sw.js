// Firebase Cloud Messaging Service Worker

importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

// Verificar si Firebase ya está inicializado
function initializeFirebase() {
  try {
    // Si no hay apps inicializadas, inicializar Firebase
    if (!firebase.apps.length) {
      const firebaseConfig = {
        apiKey: 'AIzaSyD54BJyVMZuRjo6kru654Q_pX8_TQWK5ZQ',
        authDomain: 'ais-asistente.firebaseapp.com',
        projectId: 'ais-asistente',
        storageBucket: 'ais-asistente.appspot.com',
        messagingSenderId: '100878286150069711628',
        appId: '1:100878286150069711628:web:5881666b40a94302955807'
      };
      
      firebase.initializeApp(firebaseConfig);
      console.log('[firebase-messaging-sw.js] Firebase inicializado correctamente');
      return firebase.messaging();
    } else {
      // Usar la instancia existente
      console.log('[firebase-messaging-sw.js] Usando instancia existente de Firebase');
      return firebase.messaging();
    }
  } catch (error) {
    console.error('[firebase-messaging-sw.js] Error al inicializar Firebase:', error);
    return null;
  }
}
const messaging = initializeFirebase();

// Manejo de mensajes en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Recibido mensaje en segundo plano:', payload);
  
  // Ahora solo esperamos data, ya que el backend solo envía data para evitar duplicados
  const { data } = payload;
  
  // Verificar si tenemos datos válidos para mostrar una notificación
  if (data && data.title) {
    // Usar el ID proporcionado o generar uno nuevo
    const notificationId = data.notificationId || `notification-${Date.now()}`;
    
    // Configurar opciones de la notificación
    const notificationOptions = {
      body: data.body || '',
      icon: data.icon || '/logo192.png',
      badge: data.badge || '/badge-icon.png',
      data: data,
      tag: notificationId, // Usar un tag para evitar duplicados
      actions: [
        {
          action: 'view',
          title: 'Ver'
        }
      ],
      requireInteraction: true,
      renotify: false // No notificar nuevamente si ya existe una con el mismo tag
    };
    
    // Añadir imagen solo si existe
    if (data.imageUrl) {
      notificationOptions.image = data.imageUrl;
    }

    // Notificar a todas las ventanas abiertas de la aplicación sobre la nueva notificación
    // para actualizar la interfaz de usuario
    self.clients.matchAll({type: 'window'}).then(clientList => {
      clientList.forEach(client => {
        client.postMessage({
          type: 'NEW_NOTIFICATION',
          payload: data
        });
      });
    });

    // Verificar si ya existe una notificación con el mismo tag antes de mostrarla
    self.registration.getNotifications({ tag: notificationId }).then(notifications => {
      if (notifications.length === 0) {
        // No hay notificaciones duplicadas, mostrar esta
        self.registration.showNotification(data.title, notificationOptions)
          .then(() => {
            console.log('[firebase-messaging-sw.js] Notificación mostrada correctamente:', notificationId);
          })
          .catch(error => {
            console.error('[firebase-messaging-sw.js] Error al mostrar notificación:', error);
          });
      } else {
        console.log('[firebase-messaging-sw.js] Notificación duplicada detectada, no se mostrará:', notificationId);
      }
    });
  } else {
    console.log('[firebase-messaging-sw.js] Mensaje recibido sin datos de notificación válidos');
  }
});

// Manejar clic en la notificación
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notificación clickeada', event);
  
  // Cerrar la notificación
  event.notification.close();
  
  // Obtener los datos de la notificación
  const notificationData = event.notification.data || {};
  const notificationId = notificationData.notificationId || event.notification.tag;
  
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
    
    // Preparar el mensaje para la aplicación principal
    const messagePayload = {
      type: 'NOTIFICATION_CLICKED',
      payload: {
        notificationId: notificationId,
        timestamp: Date.now(),
        data: notificationData,
        action: event.action || 'default'
      }
    };
    
    // Si encontramos una ventana existente
    if (existingClient) {
      // Primero enfocamos la ventana
      return existingClient.focus().then((focusedClient) => {
        // Luego enviamos un mensaje a la aplicación principal para actualizar las notificaciones
        console.log('[Service Worker] Enviando mensaje a cliente existente:', messagePayload);
        return focusedClient.postMessage(messagePayload);
      });
    }
    
    // Si no hay ventana abierta, abrir una nueva
    if (clients.openWindow) {
      return clients.openWindow(urlToOpen).then(client => {
        if (client) {
          console.log('[Service Worker] Ventana abierta, esperando para enviar mensaje');
          // Esperar un momento para que la aplicación se inicialice
          setTimeout(() => {
            console.log('[Service Worker] Enviando mensaje a nueva ventana:', messagePayload);
            client.postMessage(messagePayload);
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
