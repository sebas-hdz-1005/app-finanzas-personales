/**
 * Selector del adaptador de autenticación (demo | firebase) + mapeo de errores
 * a mensajes amables que no exponen detalles internos.
 */
import { isFirebaseBackend } from '@/lib/backend';
import * as demoAuth from './demoAuth';

let adapter = demoAuth;
if (isFirebaseBackend) {
  // eslint-disable-next-line global-require
  adapter = require('./firebaseAuth');
}

export const authAdapter = adapter;

const FIREBASE_ERRORS = {
  'auth/invalid-email': 'El email no es válido.',
  'auth/user-disabled': 'Esta cuenta está deshabilitada.',
  'auth/user-not-found': 'Credenciales inválidas.',
  'auth/wrong-password': 'Credenciales inválidas.',
  'auth/invalid-credential': 'Credenciales inválidas.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese email.',
  'auth/weak-password': 'La contraseña es demasiado débil (mínimo 6 caracteres).',
  'auth/too-many-requests': 'Demasiados intentos. Inténtalo más tarde.',
  'auth/network-request-failed': 'Error de red. Revisa tu conexión.',
  'auth/popup-closed-by-user': 'Cerraste la ventana de Google antes de terminar.',
  'auth/cancelled-popup-request': 'Se canceló el inicio de sesión.',
  'auth/popup-blocked': 'El navegador bloqueó la ventana emergente. Permítela e inténtalo de nuevo.',
  'auth/account-exists-with-different-credential':
    'Ya existe una cuenta con ese email usando otro método de acceso.',
  'auth/operation-not-allowed': 'Este método de acceso no está habilitado.',
  'auth/unauthorized-domain': 'Dominio no autorizado en Firebase Authentication.',
};

/**
 * Traduce cualquier error de auth a un mensaje seguro para el usuario.
 * @param {unknown} error
 * @returns {string}
 */
export function mapAuthError(error) {
  if (error && typeof error === 'object' && 'code' in error && FIREBASE_ERRORS[error.code]) {
    return FIREBASE_ERRORS[error.code];
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Ocurrió un error. Inténtalo de nuevo.';
}
