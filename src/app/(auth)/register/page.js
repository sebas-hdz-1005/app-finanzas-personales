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
import { registerSchema } from '@/validations/auth';
import { validateWith } from '@/utils/validation';
import { useTranslation } from '@/i18n/LanguageProvider';

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();
  const { t, lang } = useTranslation();
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const setField = (name, value) => setValues((v) => ({ ...v, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const { success, data, errors: errs } = validateWith(registerSchema, values, lang);
    if (!success) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    const res = await register(data.name, data.email, data.password);
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

  return (
    <AuthShell subtitle={t('auth.registerSubtitle')}>
      <div className="glass-panel rounded-xl p-8 relative overflow-hidden">
        <div className="scan-line" />
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <FormField label={t('auth.operatorName')} htmlFor="name" error={errors.name} required>
            <Input
              id="name"
              icon="badge"
              autoComplete="name"
              value={values.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder={t('auth.namePlaceholder')}
              error={errors.name}
            />
          </FormField>

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
              autoComplete="new-password"
              value={values.password}
              onChange={(e) => setField('password', e.target.value)}
              placeholder={t('auth.newPasswordPlaceholder')}
              error={errors.password}
            />
          </FormField>

          <FormField
            label={t('auth.confirmKey')}
            htmlFor="confirmPassword"
            error={errors.confirmPassword}
            required
          >
            <Input
              id="confirmPassword"
              type="password"
              icon="lock_reset"
              autoComplete="new-password"
              value={values.confirmPassword}
              onChange={(e) => setField('confirmPassword', e.target.value)}
              placeholder={t('auth.repeatPasswordPlaceholder')}
              error={errors.confirmPassword}
            />
          </FormField>

          {formError && (
            <p role="alert" className="text-error text-body-md text-center">
              {formError}
            </p>
          )}

          <Button type="submit" variant="primary" fullWidth size="lg" loading={loading} iconRight="bolt">
            {t('auth.createEntity')}
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

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="font-label-caps text-label-caps text-outline hover:text-primary-fixed-dim transition-colors inline-flex items-center gap-1"
          >
            <Icon name="arrow_back" className="text-base" /> {t('auth.backToLogin')}
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
