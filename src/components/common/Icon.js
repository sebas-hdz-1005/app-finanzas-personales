import { cn } from '@/utils/cn';

/**
 * Icono de Material Symbols Outlined.
 * @param {{name:string, className?:string, filled?:boolean, size?:number}} props
 */
export function Icon({ name, className, filled = false, size, ...rest }) {
  const style = {};
  if (size) style.fontSize = `${size}px`;
  if (filled) style.fontVariationSettings = "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24";
  return (
    <span
      aria-hidden="true"
      className={cn('material-symbols-outlined', className)}
      style={style}
      {...rest}
    >
      {name}
    </span>
  );
}
