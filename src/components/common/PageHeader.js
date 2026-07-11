/**
 * Cabecera de página estilo terminal: título display + subtítulo + acciones.
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {React.ReactNode} [props.actions]
 */
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-gutter">
      <div>
        <h1 className="font-display-lg text-[32px] leading-[40px] md:text-display-lg text-primary-fixed mb-1 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="font-body-lg text-body-lg text-on-surface-variant">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}
