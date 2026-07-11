import { cn } from '@/utils/cn';

/**
 * Envoltorio de campo: label + control + mensaje de error accesible.
 * @param {object} props
 * @param {string} props.label
 * @param {string} props.htmlFor
 * @param {string} [props.error]
 * @param {boolean} [props.required]
 */
export function FormField({ label, htmlFor, error, required, children, className, hint }) {
  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={htmlFor}
        className="font-label-caps text-label-caps text-outline block ml-1 uppercase tracking-wider"
      >
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-outline/70 ml-1">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="text-[11px] text-error ml-1">
          {error}
        </p>
      )}
    </div>
  );
}
