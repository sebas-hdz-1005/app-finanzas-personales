import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

/**
 * Select del design system.
 * @param {object} props
 * @param {Array<{value:string,label:string}>} props.options
 */
export const Select = forwardRef(function Select(
  { className, options = [], error, id, placeholder, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      id={id}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      className={cn(
        'w-full bg-surface-container/40 border border-white/10 rounded-lg py-3 px-4 font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary-fixed-dim/20 focus:border-primary-fixed-dim outline-none transition-all',
        error && 'border-error',
        className,
      )}
      {...rest}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
});
