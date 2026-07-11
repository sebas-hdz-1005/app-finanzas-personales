import { translateValidation } from '@/i18n/validationMessages';

/**
 * Ejecuta un esquema Zod y devuelve errores mapeados por campo (traducidos).
 * @param {import('zod').ZodTypeAny} schema
 * @param {object} values
 * @param {'es'|'en'} [lang='es']
 * @returns {{success:boolean, data?:object, errors:Record<string,string>}}
 */
export function validateWith(schema, values, lang = 'es') {
  const result = schema.safeParse(values);
  if (result.success) return { success: true, data: result.data, errors: {} };
  const errors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (key != null && !errors[key]) errors[key] = translateValidation(issue.message, lang);
  }
  return { success: false, errors };
}
