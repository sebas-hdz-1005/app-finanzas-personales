/**
 * Inicialización de Firebase (sólo cuando el backend es "firebase").
 * Las claves NEXT_PUBLIC_* son públicas por diseño; la seguridad la imponen
 * las reglas de Firestore.
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { isFirebaseBackend, USE_EMULATORS } from '@/lib/backend';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app = null;
let auth = null;
let db = null;

/** Inicializa (una sola vez) y devuelve las instancias de Firebase. */
export function getFirebase() {
  if (!isFirebaseBackend) {
    throw new Error('Firebase no está activo. Usa NEXT_PUBLIC_DATA_BACKEND=firebase.');
  }
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error(
      'Faltan variables de entorno de Firebase. Revisa .env.local (ver GUIA_DESPLIEGUE.md).',
    );
  }
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    if (USE_EMULATORS && typeof window !== 'undefined' && !window.__NL_EMULATORS__) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, 'localhost', 8080);
      window.__NL_EMULATORS__ = true;
    }
  }
  return { app, auth, db };
}
