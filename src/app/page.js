'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { LoadingState } from '@/components/common/Spinner';
import { useTranslation } from '@/i18n/LanguageProvider';

/** Punto de entrada: redirige según el estado de sesión. */
export default function RootPage() {
  const { isAuthenticated, loading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(isAuthenticated ? '/dashboard' : '/login');
  }, [isAuthenticated, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingState label={t('auth.initializing')} />
    </div>
  );
}
