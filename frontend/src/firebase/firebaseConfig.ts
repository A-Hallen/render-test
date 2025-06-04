import { initializeApp, getApp, getApps } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD54BJyVMZuRjo6kru654Q_pX8_TQWK5ZQ',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'ais-asistente.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'ais-asistente',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'ais-asistente.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '100878286150069711628',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:100878286150069711628:web:5881666b40a94302955807'
};

// Clave VAPID para notificaciones web push
export const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

// Inicializar Firebase solo si no hay una instancia existente
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Inicializar Firebase Cloud Messaging
// Solo inicializar en entornos de navegador que soporten service workers
export const messaging = typeof window !== 'undefined' && 'serviceWorker' in navigator
  ? getMessaging(app)
  : null;

export { app, db, firebaseConfig };
