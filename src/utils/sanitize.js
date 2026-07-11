/**
 * Sanitización básica de entradas de texto.
 */

// Rango de caracteres de control ASCII (0x00-0x1F y 0x7F).
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\x00-\x1F\x7F]/g;

/**
 * Recorta, elimina caracteres de control y limita longitud.
 * @param {unknown} value
 * @param {number} [maxLength=500]
 * @returns {string}
 */
export function sanitizeString(value, maxLength = 500) {
  if (value == null) return '';
  const str = String(value).replace(CONTROL_CHARS, '').trim();
  return str.slice(0, maxLength);
}

/**
 * Normaliza un email (trim + minúsculas).
 * @param {unknown} value
 * @returns {string}
 */
export function sanitizeEmail(value) {
  return sanitizeString(value, 254).toLowerCase();
}

/**
 * Convierte a número seguro, opcionalmente acotado.
 * @param {unknown} value
 * @param {object} [opts]
 * @param {number} [opts.min]
 * @param {number} [opts.max]
 * @returns {number}
 */
export function sanitizeNumber(value, opts = {}) {
  const { min = -Infinity, max = Infinity } = opts;
  const n = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, ''));
  if (!Number.isFinite(n)) return 0;
  return Math.min(Math.max(n, min), max);
}
