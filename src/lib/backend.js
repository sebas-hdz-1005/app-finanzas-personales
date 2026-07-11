/**
 * Selección del backend de datos según variable de entorno.
 * "demo"      → localStorage / memoria (sin credenciales).
 * "firebase"  → Firestore + Firebase Auth.
 */
export const DATA_BACKEND =
  (process.env.NEXT_PUBLIC_DATA_BACKEND || 'demo').toLowerCase() === 'firebase'
    ? 'firebase'
    : 'demo';

export const isFirebaseBackend = DATA_BACKEND === 'firebase';
export const isDemoBackend = DATA_BACKEND === 'demo';

export const USE_EMULATORS =
  String(process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATORS).toLowerCase() === 'true';
