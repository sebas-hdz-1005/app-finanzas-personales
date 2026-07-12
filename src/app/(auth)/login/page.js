'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthShell } from '@/components/layout/AuthShell';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { GoogleButton } from '@/components/common/GoogleButton';
import { useAuth } from '@/features/auth/AuthContext';
import { loginSchema } from '@/validations/auth';
import { validateWith } from '@/utils/validation';
import { isDemoBackend } from '@/lib/backend';
import { useTranslation } from '@/i18n/LanguageProvider';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const { t, lang } = useTranslation();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const setField = (name, value) => setValues((v) => ({ ...v, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const { success, data, errors: errs } = validateWith(loginSchema, values, lang);
    if (!success) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    const res = await login(data.email, data.password);
    setLoading(false);
    if (res.ok) router.replace('/dashboard');
    else setFormError(res.error);
  };

  const handleGoogle = async () => {
    setFormError('');
    setGoogleLoading(true);
    const res = await loginWithGoogle();
    setGoogleLoading(false);
    if (res.ok) router.replace('/dashboard');
    else setFormError(res.error);
  };

  const fillDemo = () => setValues({ email: 'demo@neonledger.app', password: 'demo1234' });

  return (
    <AuthShell subtitle={t('auth.subtitle')}>
      <div className="glass-panel rounded-xl p-8 relative overflow-hidden">
        <div className="scan-line" />
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="status-dot bg-primary-fixed-dim shadow-[0_0_8px_#7c6cf0]" />
          <span className="font-label-caps text-[10px] text-outline uppercase">{t('auth.nodeSecure')}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2" noValidate>
          <FormField label={t('auth.terminalId')} htmlFor="email" error={errors.email} required>
            <Input
              id="email"
              type="email"
              icon="fingerprint"
              autoComplete="email"
              value={values.email}
              onChange={(e) => setField('email', e.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              error={errors.email}
              className="font-data-mono text-primary-fixed"
            />
          </FormField>

          <FormField label={t('auth.accessKey')} htmlFor="password" error={errors.password} required>
            <Input
              id="password"
              type="password"
              icon="lock"
              autoComplete="current-password"
              value={values.password}
              onChange={(e) => setField('password', e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              error={errors.password}
            />
          </FormField>

          {formError && (
            <p role="alert" className="text-error text-body-md text-center">
              {formError}
            </p>
          )}

          <Button type="submit" variant="primary" fullWidth size="lg" loading={loading} iconRight="bolt">
            {t('auth.establishUplink')}
          </Button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <span className="h-px bg-black/10 flex-1" />
          <span className="font-label-caps text-[10px] text-outline uppercase">{t('auth.or')}</span>
          <span className="h-px bg-black/10 flex-1" />
        </div>

        <GoogleButton onClick={handleGoogle} loading={googleLoading} disabled={loading}>
          {t('auth.continueWithGoogle')}
        </GoogleButton>

        <div className="mt-6 flex justify-between items-center px-1">
          <Link
            href="/recover"
            className="font-label-caps text-label-caps text-outline hover:text-primary-fixed-dim transition-colors flex items-center gap-1"
          >
            <Icon name="emergency_home" className="text-base" /> {t('auth.recoverNode')}
          </Link>
          <Link
            href="/register"
            className="font-label-caps text-label-caps text-outline hover:text-primary-fixed-dim transition-colors flex items-center gap-1"
          >
            {t('auth.newEntity')} <Icon name="arrow_forward" className="text-base" />
          </Link>
        </div>
      </div>

      {isDemoBackend && (
        <button
          type="button"
          onClick={fillDemo}
          className="mt-6 w-full text-center font-data-mono text-[11px] text-outline hover:text-primary-fixed-dim transition-colors"
        >
          {t('auth.demoHint')}
        </button>
      )}
    </AuthShell>
  );
}
