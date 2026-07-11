'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { AppShell } from '@/components/layout/AppShell';
import { LoadingState } from '@/components/common/Spinner';
import { useTranslation } from '@/i18n/LanguageProvider';

/** Layout protegido: exige sesión válida; si no, redirige a /login. */
export default function DashboardLayout({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/login');
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState label={t('auth.establishingLink')} />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
