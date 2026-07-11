/**
 * Formateadores de moneda, fechas y porcentajes.
 * Puros y testeables (sin dependencias de UI).
 * El locale es configurable (lo ajusta el proveedor de idioma).
 */

let currentLocale = 'es-MX';

/**
 * Monedas que en la práctica no usan decimales (se muestran sin centavos).
 * Incluye las de cero decimales de ISO 4217 y otras de uso común (COP, ARS…).
 */
const NO_DECIMAL_CURRENCIES = new Set([
  'COP', 'CLP', 'ARS', 'JPY', 'KRW', 'VND', 'PYG', 'ISK', 'HUF', 'CRC',
  'GNF', 'RWF', 'UGX', 'XAF', 'XOF', 'XPF', 'BIF', 'KMF', 'DJF',
]);

/** Decimales a mostrar para una moneda (0 para las sin centavos, 2 para el resto). */
function decimalsFor(currency) {
  return currency && NO_DECIMAL_CURRENCIES.has(currency) ? 0 : 2;
}

/** Ajusta el locale usado por los formateadores (p. ej. 'es-MX' | 'en-US'). */
export function setFormatLocale(locale) {
  if (locale) currentLocale = locale;
}

/** Devuelve el locale actual de formateo. */
export function getFormatLocale() {
  return currentLocale;
}

/**
 * Formatea un número como moneda.
 * @param {number} value
 * @param {string} [currency='MXN']
 * @param {object} [opts]
 * @param {boolean} [opts.showSign=false] añade '+' explícito a positivos
 * @param {boolean} [opts.compact=false] notación compacta (22.2k)
 * @returns {string}
 */
export function formatCurrency(value, currency = 'MXN', opts = {}) {
  const { showSign = false, compact = false } = opts;
  const safe = Number.isFinite(value) ? value : 0;
  const decimals = decimalsFor(currency);
  const formatter = new Intl.NumberFormat(currentLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: compact ? 0 : decimals,
    maximumFractionDigits: compact ? 1 : decimals,
    notation: compact ? 'compact' : 'standard',
  });
  const formatted = formatter.format(Math.abs(safe));
  if (safe < 0) return `-${formatted}`;
  if (showSign && safe > 0) return `+${formatted}`;
  return formatted;
}

/**
 * Formatea sólo el número (sin símbolo de moneda), útil para tablas tipo ledger.
 * @param {number} value
 * @param {object} [opts]
 * @returns {string}
 */
export function formatAmount(value, opts = {}) {
  const { showSign = true, currency } = opts;
  const safe = Number.isFinite(value) ? value : 0;
  const decimals = decimalsFor(currency);
  const formatted = new Intl.NumberFormat(currentLocale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(safe));
  if (safe < 0) return `-${formatted}`;
  if (showSign && safe > 0) return `+${formatted}`;
  return formatted;
}

/**
 * Convierte una fecha (ISO string o Date) a formato corto local.
 * @param {string|Date} date
 * @returns {string} p. ej. "12 may 2024"
 */
export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(currentLocale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/**
 * Formato tipo ledger "2024.05.12 14:44:02".
 * @param {string|Date} date
 * @returns {string}
 */
export function formatLedgerTimestamp(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * Formatea un ratio (0..1) o porcentaje directo como cadena "%".
 * @param {number} value
 * @param {object} [opts]
 * @param {boolean} [opts.isRatio=true] si true, multiplica por 100
 * @param {number} [opts.decimals=1]
 * @returns {string}
 */
export function formatPercent(value, opts = {}) {
  const { isRatio = true, decimals = 1 } = opts;
  const safe = Number.isFinite(value) ? value : 0;
  const pct = isRatio ? safe * 100 : safe;
  return `${pct.toFixed(decimals)}%`;
}

/**
 * Devuelve la clave de mes "YYYY-MM" de una fecha.
 * @param {string|Date} date
 * @returns {string}
 */
export function monthKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

/** Devuelve la fecha de hoy en formato input date (YYYY-MM-DD). */
export function todayISODate() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
