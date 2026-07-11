/**
 * Almacén de bajo nivel para el backend DEMO.
 * Isomorfo: usa localStorage en el navegador y un objeto en memoria como
 * respaldo (SSR / tests). Cada colección es una lista de registros de todos
 * los usuarios; el filtrado por `userId` lo hace el repositorio (igual que
 * las colecciones raíz de Firestore).
 */

const PREFIX = 'neon_ledger:';
const memory = {};

function hasLocalStorage() {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    return false;
  }
}

/**
 * Lee todos los registros de una colección.
 * @param {string} collection
 * @returns {Array<object>}
 */
export function readAll(collection) {
  if (hasLocalStorage()) {
    try {
      const raw = window.localStorage.getItem(PREFIX + collection);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  return memory[collection] ? [...memory[collection]] : [];
}

/**
 * Sobreescribe todos los registros de una colección.
 * @param {string} collection
 * @param {Array<object>} records
 */
export function writeAll(collection, records) {
  if (hasLocalStorage()) {
    try {
      window.localStorage.setItem(PREFIX + collection, JSON.stringify(records));
      return;
    } catch {
      /* fall through to memory */
    }
  }
  memory[collection] = [...records];
}

/** Genera un id único. */
export function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Limpia por completo el almacén demo (usado en logout/reset/tests). */
export function clearStore() {
  if (hasLocalStorage()) {
    const keys = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(PREFIX)) keys.push(k);
    }
    keys.forEach((k) => window.localStorage.removeItem(k));
  }
  Object.keys(memory).forEach((k) => delete memory[k]);
}
