/** Efecto de fondo con halos de neón difuminados (del diseño del dashboard). */
export function GlowBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 opacity-30" aria-hidden="true">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-fixed/20 blur-[120px] rounded-full animate-pulse" />
      <div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary-fixed/10 blur-[100px] rounded-full"
        style={{ animation: 'pulse 8s infinite' }}
      />
    </div>
  );
}
