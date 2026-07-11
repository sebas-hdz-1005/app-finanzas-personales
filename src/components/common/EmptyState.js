import { cn } from '@/utils/cn';
import { Icon } from './Icon';

/**
 * Estado vacío reutilizable.
 * @param {object} props
 * @param {string} [props.icon]
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {React.ReactNode} [props.action]
 */
export function EmptyState({ icon = 'inbox', title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6 gap-3',
        className,
      )}
    >
      <div className="w-16 h-16 rounded-full bg-black/5 border border-black/10 flex items-center justify-center">
        <Icon name={icon} className="text-3xl text-outline" />
      </div>
      <h3 className="font-headline-md text-headline-md text-on-surface">{title}</h3>
      {description && (
        <p className="font-body-md text-body-md text-on-surface-variant max-w-md">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
