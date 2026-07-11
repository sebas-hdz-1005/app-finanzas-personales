/**
 * Autenticación DEMO (sin backend). Persiste usuarios y sesión en localStorage.
 * NO es seguridad real: es un mecanismo de demostración local y así se documenta.
 * Las contraseñas se guardan con un hash trivial (no reversible a simple vista),
 * suficiente para una demo local sin credenciales sensibles en el código.
 */

const USERS_KEY = 'neon_ledger:auth:users';
const SESSION_KEY = 'neon_ledger:auth:session';

const DEMO_USER = {
  email: 'demo@neonledger.app',
  password: 'demo1234',
  name: 'Operador Demo',
};

const listeners = new Set();

function browser() {
  return typeof window !== 'undefined' && !!window.localStorage;
}

/** Hash trivial (djb2) — sólo para no guardar la contraseña en claro en la demo. */
function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i += 1) h = (h * 33) ^ str.charCodeAt(i);
  return (h >>> 0).toString(16);
}

function readUsers() {
  if (!browser()) return [];
  try {
    return JSON.parse(window.localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeUsers(users) {
  if (browser()) window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function ensureDemoUser() {
  const users = readUsers();
  if (!users.some((u) => u.email === DEMO_USER.email)) {
    users.push({
      uid: 'demo-user',
      email: DEMO_USER.email,
      name: DEMO_USER.name,
      photoURL: null,
      passwordHash: hash(DEMO_USER.password),
    });
    writeUsers(users);
  }
}

function toPublicUser(u) {
  return u ? { uid: u.uid, email: u.email, displayName: u.name, photoURL: u.photoURL || null } : null;
}

function emit(user) {
  listeners.forEach((cb) => cb(user));
}

export function getCurrentUser() {
  if (!browser()) return null;
  ensureDemoUser();
  const uid = window.localStorage.getItem(SESSION_KEY);
  if (!uid) return null;
  const user = readUsers().find((u) => u.uid === uid);
  return toPublicUser(user);
}

export function onAuthChange(cb) {
  listeners.add(cb);
  // Emite el estado actual de forma asíncrona (imita a Firebase).
  setTimeout(() => cb(getCurrentUser()), 0);
  return () => listeners.delete(cb);
}

export async function signIn(email, password) {
  ensureDemoUser();
  const users = readUsers();
  const user = users.find((u) => u.email === email.toLowerCase());
  if (!user || user.passwordHash !== hash(password)) {
    throw new Error('Credenciales inválidas. Verifica tu email y contraseña.');
  }
  window.localStorage.setItem(SESSION_KEY, user.uid);
  const pub = toPublicUser(user);
  emit(pub);
  return pub;
}

export async function signUp(name, email, password) {
  ensureDemoUser();
  const users = readUsers();
  const lower = email.toLowerCase();
  if (users.some((u) => u.email === lower)) {
    throw new Error('Ya existe una cuenta con ese email.');
  }
  const uid = `demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const user = { uid, email: lower, name, photoURL: null, passwordHash: hash(password) };
  users.push(user);
  writeUsers(users);
  window.localStorage.setItem(SESSION_KEY, uid);
  const pub = toPublicUser(user);
  emit(pub);
  return pub;
}

export async function signOutUser() {
  if (browser()) window.localStorage.removeItem(SESSION_KEY);
  emit(null);
}

export async function sendReset(email) {
  const users = readUsers();
  if (!users.some((u) => u.email === email.toLowerCase())) {
    // No revelar si el email existe (buena práctica). Se resuelve igual.
  }
  // En demo no hay envío real de correo.
  return true;
}
