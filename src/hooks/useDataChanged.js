'use client';

import { useEffect } from 'react';

const EVENT = 'neon:data-changed';

/** Notifica a toda la app que los datos cambiaron (para re-fetch reactivo). */
export function emitDataChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT));
  }
}

/** Suscribe un callback a los cambios de datos. */
export function useDataChanged(callback) {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handler = () => callback();
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, [callback]);
}
