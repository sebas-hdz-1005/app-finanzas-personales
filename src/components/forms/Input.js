import { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/common/Icon';

const baseInput =
  'w-full bg-surface-container/40 border border-white/10 rounded-lg py-3 px-4 font-body-md text-body-md text-on-surface placeholder:text-outline/40 focus:ring-2 focus:ring-primary-fixed-dim/20 focus:border-primary-fixed-dim outline-none transition-all';

export const Input = forwardRef(function Input(
  { className, icon, error, id, ...rest },
  ref,
) {
  return (
    <div className="relative">
      {icon && (
        <Icon
          name={icon}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none"
        />
      )}
      <input
        ref={ref}
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(baseInput, icon && 'pl-12', error && 'border-error focus:border-error', className)}
        {...rest}
      />
    </div>
  );
});

export const Textarea = forwardRef(function Textarea({ className, error, id, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      id={id}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      className={cn(baseInput, 'min-h-[90px] resize-y', error && 'border-error', className)}
      {...rest}
    />
  );
});
