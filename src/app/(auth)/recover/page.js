'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthShell } from '@/components/layout/AuthShell';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { useAuth } from '@/features/auth/AuthContext';
import { recoverSchema } from '@/validations/auth';
import { validateWith } from '@/utils/validation';
import { isDemoBackend } from '@/lib/backend';
import { useTranslation } from '@/i18n/LanguageProvider';

export default function RecoverPage() {
  const { resetPassword } = useAuth();
  const { t, lang } = useTranslation();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { success, data, errors: errs } = validateWith(recoverSchema, { email }, lang);
    if (!success) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    await resetPassword(data.email);
    setLoading(false);
    setSent(true);
  };

  return (
    <AuthShell subtitle={t('auth.recoverSubtitle')}>
      <div className="glass-panel rounded-xl p-8 relative overflow-hidden">
        <div className="scan-line" />
        {sent ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-secondary-fixed/10 border border-secondary-fixed/30 flex items-center justify-center">
              <Icon name="mark_email_read" className="text-3xl text-secondary-fixed" />
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface">{t('auth.recoverSentTitle')}</h2>
            <p className="font-body-md text-on-surface-variant">{t('auth.recoverSentBody', { email })}</p>
            {isDemoBackend && (
              <p className="font-data-mono text-[11px] text-outline">{t('auth.recoverDemoNote')}</p>
            )}
            <Link href="/login" className="inline-block">
              <Button variant="ghost" icon="arrow_back">
                {t('auth.backToLogin')}
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <p className="font-body-md text-on-surface-variant mb-6">{t('auth.recoverIntro')}</p>
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <FormField label={t('auth.terminalId')} htmlFor="email" error={errors.email} required>
                <Input
                  id="email"
                  type="email"
                  icon="fingerprint"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  error={errors.email}
                  className="font-data-mono text-primary-fixed"
                />
              </FormField>
              <Button type="submit" variant="primary" fullWidth size="lg" loading={loading} iconRight="send">
                {t('auth.sendLink')}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="font-label-caps text-label-caps text-outline hover:text-primary-fixed-dim transition-colors inline-flex items-center gap-1"
              >
                <Icon name="arrow_back" className="text-base" /> {t('auth.backToLogin')}
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthShell>
  );
}
