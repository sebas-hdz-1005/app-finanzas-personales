import { APP_NAME } from '@/constants';

/**
 * Marco visual para las pantallas de autenticación.
 * Fondo con rejilla suave y halo lavanda difuminado.
 */
export function AuthShell({ children, subtitle }) {
  const year = new Date().getFullYear();
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fondo */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 data-grid-bg matrix-fade" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-fixed-dim/10 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 flex items-center justify-center min-h-screen px-margin-mobile md:px-margin-desktop py-12">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <h1 className="font-headline-lg text-headline-lg font-bold text-surface-tint tracking-tight mb-2">
              {APP_NAME}
            </h1>
            {subtitle && (
              <p className="font-body-md text-body-md text-on-surface-variant">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </main>

      <footer className="fixed bottom-0 w-full flex justify-center items-center px-margin-mobile md:px-margin-desktop py-4 z-10 border-t border-black/5">
        <span className="font-data-mono text-[11px] text-outline">
          © {year} · {APP_NAME}
        </span>
      </footer>
    </div>
  );
}
