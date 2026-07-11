import { cn } from '@/utils/cn';

const TONES = {
  success: 'bg-secondary-fixed/10 text-secondary-fixed',
  error: 'bg-error/10 text-error',
  cyan: 'bg-primary-fixed/10 text-primary-fixed',
  neutral: 'bg-white/5 text-outline',
};

/**
 * Chip/etiqueta mono-espaciada.
 * @param {{tone?: 'success'|'error'|'cyan'|'neutral', children: any, className?: string}} props
 */
export function Badge({ children, tone = 'neutral', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded font-label-caps text-[10px] uppercase tracking-wider',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
