'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { useToast } from '@/components/common/Toast';
import { useTranslation } from '@/i18n/LanguageProvider';

/** Minutos de inactividad antes de cerrar la sesión. */
export const IDLE_TIMEOUT_MINUTES = 30;
const IDLE_MS = IDLE_TIMEOUT_MINUTES * 60 * 1000;
const STORAGE_KEY = 'neon_ledger:lastActivity';
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

/**
 * Cierra la sesión tras `IDLE_TIMEOUT_MINUTES` de inactividad. Además, al volver
 * a abrir la página (nueva pestaña, tras apagar el PC…), si pasó más tiempo del
 * permitido desde la última actividad, cierra la sesión de inmediato.
 */
export function useIdleLogout() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslation();
  const timer = useRef(null);
  const lastStore = useRef(0);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let ended = false;

    const readLast = () => {
      try {
        return Number(window.localStorage.getItem(STORAGE_KEY)) || 0;
      } catch {
        return 0;
      }
    };
    const writeLast = (ts) => {
      try {
        window.localStorage.setItem(STORAGE_KEY, String(ts));
      } catch {
        /* noop */
      }
    };

    const doLogout = async () => {
      if (ended) return;
      ended = true;
      if (timer.current) clearTimeout(timer.current);
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* noop */
      }
      await logout();
      toast.info(t('auth.sessionExpired'));
      router.replace('/login');
    };

    const arm = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(doLogout, IDLE_MS);
    };

    const onActivity = () => {
      if (ended) return;
      arm();
      const now = Date.now();
      if (now - lastStore.current > 10000) {
        // Persistir sólo cada 10 s para no saturar localStorage.
        lastStore.current = now;
        writeLast(now);
      }
    };

    const onVisible = () => {
      if (document.visibilityState !== 'visible' || ended) return;
      const last = readLast();
      if (last && Date.now() - last > IDLE_MS) doLogout();
      else arm();
    };

    // Al montar: si la última actividad es demasiado antigua, cerrar ya.
    const last = readLast();
    if (last && Date.now() - last > IDLE_MS) {
      doLogout();
      return () => {
        ended = true;
      };
    }

    lastStore.current = Date.now();
    writeLast(lastStore.current);
    arm();
    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      ended = true;
      if (timer.current) clearTimeout(timer.current);
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, onActivity));
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [isAuthenticated, logout, router, toast, t]);
}
