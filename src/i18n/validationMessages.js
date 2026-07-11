/**
 * Traducción de los mensajes de validación (Zod) definidos en español.
 * Los esquemas conservan el mensaje en español como "clave"; aquí se mapea a EN.
 * Sin dependencias de React (usable en servicios y utilidades).
 */
const ES_TO_EN = {
  'El email es obligatorio': 'Email is required',
  'Email inválido': 'Invalid email',
  'La contraseña debe tener al menos 6 caracteres': 'Password must be at least 6 characters',
  'El nombre debe tener al menos 2 caracteres': 'Name must be at least 2 characters',
  'Las contraseñas no coinciden': 'Passwords do not match',
  'Monto inválido': 'Invalid amount',
  'Tipo inválido': 'Invalid type',
  'Selecciona una cuenta': 'Select an account',
  'Selecciona una categoría': 'Select a category',
  'El título es obligatorio': 'Title is required',
  'El monto debe ser mayor a 0': 'Amount must be greater than 0',
  'La fecha es obligatoria': 'Date is required',
  'El nombre es obligatorio': 'Name is required',
  'Color inválido': 'Invalid color',
  'El límite debe ser mayor a 0': 'Limit must be greater than 0',
  'La fecha de inicio es obligatoria': 'Start date is required',
  'La meta debe ser mayor a 0': 'Target must be greater than 0',
  'No puede ser negativo': 'Cannot be negative',
  'La fecha objetivo es obligatoria': 'Target date is required',
};

/**
 * Traduce un mensaje de validación al idioma dado (por defecto lo deja igual, en español).
 * @param {string} message
 * @param {'es'|'en'} [lang='es']
 * @returns {string}
 */
export function translateValidation(message, lang = 'es') {
  if (lang === 'en' && ES_TO_EN[message]) return ES_TO_EN[message];
  return message;
}
