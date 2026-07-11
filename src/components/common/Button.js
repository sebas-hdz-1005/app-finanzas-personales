import { cn } from '@/utils/cn';
import { Icon } from './Icon';

const VARIANTS = {
  // Botón primario: cyan sólido con texto oscuro (design system).
  primary:
    'bg-primary-container text-on-primary-container hover:brightness-110 active:scale-95 shadow-lg',
  // Secundario "ghost": borde cyan con glow en hover.
  ghost:
    'border border-primary/30 text-primary-fixed hover:bg-primary/5 glow-hover',
  outline: 'border border-black/10 bg-black/5 text-on-surface hover:bg-black/10',
  danger: 'border border-error/40 text-error hover:bg-error/10',
  subtle: 'text-on-surface-variant hover:text-primary-fixed hover:bg-black/5',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-label-caps',
  md: 'px-5 py-2.5 text-label-caps',
  lg: 'px-6 py-4 text-label-caps',
};

/**
 * Botón del design system.
 * @param {object} props
 * @param {'primary'|'ghost'|'outline'|'danger'|'subtle'} [props.variant]
 * @param {'sm'|'md'|'lg'} [props.size]
 * @param {string} [props.icon] nombre de Material Symbol
 * @param {boolean} [props.loading]
 * @param {boolean} [props.fullWidth]
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  fullWidth = false,
  className,
  type = 'button',
  disabled,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-label-caps font-bold uppercase tracking-wider rounded-lg transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Icon name="progress_activity" className="animate-spin text-[18px]" />
      ) : (
        icon && <Icon name={icon} className="text-[18px]" />
      )}
      {children}
      {iconRight && !loading && <Icon name={iconRight} className="text-[18px]" />}
    </button>
  );
}
