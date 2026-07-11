/** Pie de página fijo estilo terminal (oculto en móvil para dejar sitio a MobileNav). */
export function Footer() {
  return (
    <footer className="fixed bottom-0 w-full hidden md:flex justify-between items-center px-margin-desktop py-2 z-30 bg-surface-dim/90 backdrop-blur-md border-t border-white/5">
      <div className="flex gap-6 items-center">
        <span className="font-label-caps text-label-caps text-secondary-fixed">NEON_LEDGER v2.4.1</span>
        <div className="h-4 w-px bg-white/10" />
        <span className="font-data-mono text-[10px] text-outline">© 2024 ENCRYPTED SESSION ACTIVE</span>
      </div>
      <div className="hidden lg:flex gap-8">
        <span className="font-data-mono text-data-mono text-outline">API Status: Optimal</span>
        <span className="font-data-mono text-data-mono text-outline">Security Protocol: Active</span>
        <span className="font-data-mono text-data-mono text-outline">Uptime: 99.9%</span>
      </div>
    </footer>
  );
}
