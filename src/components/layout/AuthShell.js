/**
 * Marco visual para las pantallas de autenticación (terminal de acceso).
 * Reproduce el fondo de rejilla de datos y el halo ambiental del diseño.
 */
export function AuthShell({ children, subtitle = 'Institutional Grade Finance' }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fondo */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 data-grid-bg matrix-fade" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-fixed-dim/5 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 flex items-center justify-center min-h-screen px-margin-mobile md:px-margin-desktop py-12">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <h1 className="font-headline-lg text-headline-lg font-bold text-surface-tint tracking-tighter mb-2">
              NEON_LEDGER
            </h1>
            <p className="font-label-caps text-label-caps text-primary-fixed tracking-widest uppercase">
              {subtitle}
            </p>
          </div>
          {children}
        </div>
      </main>

      <footer className="fixed bottom-0 w-full flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 z-10 border-t border-white/5 opacity-50">
        <span className="font-data-mono text-[10px] text-outline uppercase tracking-widest">
          © 2024 NEON_LEDGER v2.4.1
        </span>
        <span className="font-data-mono text-[10px] text-primary-fixed-dim hidden sm:inline">
          SECURITY PROTOCOL: ACTIVE
        </span>
      </footer>
    </div>
  );
}
