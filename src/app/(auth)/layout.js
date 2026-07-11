'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { LoadingState } from '@/components/common/Spinner';
import { useTranslation } from '@/i18n/LanguageProvider';

/** Layout de autenticación: si ya hay sesión, redirige al dashboard. */
export default function AuthLayout({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, loading, router]);

  if (loading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState label={t('auth.verifyingSession')} />
      </div>
    );
  }

  return children;
}
