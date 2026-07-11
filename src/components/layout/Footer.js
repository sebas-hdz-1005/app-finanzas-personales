import { APP_NAME } from '@/constants';

/** Pie de página fijo (oculto en móvil para dejar sitio a MobileNav). */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="fixed bottom-0 w-full hidden md:flex justify-between items-center px-margin-desktop py-2 z-30 bg-surface-dim/90 backdrop-blur-md border-t border-black/5">
      <span className="font-label-caps text-label-caps text-on-surface-variant">{APP_NAME}</span>
      <span className="font-data-mono text-[11px] text-outline">© {year} · {APP_NAME}</span>
    </footer>
  );
}
