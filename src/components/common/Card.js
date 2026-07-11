import { cn } from '@/utils/cn';

const ACCENTS = {
  none: '',
  cyan: 'neon-border-cyan',
  success: 'neon-border-success',
  error: 'neon-border-error',
};

/**
 * Panel de vidrio (glassmorphism) del design system.
 * @param {object} props
 * @param {'none'|'cyan'|'success'|'error'} [props.accent]
 * @param {string} [props.status] color del status-light (clase bg-*)
 */
export function Card({ children, className, accent = 'none', status, as: Tag = 'div', ...rest }) {
  return (
    <Tag className={cn('glass-panel p-6', ACCENTS[accent], className)} {...rest}>
      {status && <span className={cn('status-light', status)} />}
      {children}
    </Tag>
  );
}
