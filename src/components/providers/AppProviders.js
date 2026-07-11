'use client';

import { LanguageProvider } from '@/i18n/LanguageProvider';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ToastProvider } from '@/components/common/Toast';

/** Envuelve la app con los proveedores globales (idioma + auth + notificaciones). */
export function AppProviders({ children }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
