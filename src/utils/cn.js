/**
 * Une clases condicionalmente (utilidad mínima, sin dependencias).
 * @param {...(string|false|null|undefined)} classes
 * @returns {string}
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
