'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useTranslation } from '@/i18n/LanguageProvider';
import { userService } from '@/services';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { useToast } from '@/components/common/Toast';
import { profileSchema } from '@/validations/finance';
import { validateWith } from '@/utils/validation';
import { CURRENCIES } from '@/constants';

export default function ProfilePage() {
  const { user, profile, currency, refreshProfile } = useAuth();
  const { t, lang } = useTranslation();
  const toast = useToast();
  const [values, setValues] = useState({
    name: profile?.name || user?.displayName || '',
    currency: currency || 'MXN',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const setField = (n, v) => setValues((s) => ({ ...s, [n]: v }));
  const initial = (values.name || t('profile.operator')).charAt(0).toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { success, data, errors: errs } = validateWith(profileSchema, values, lang);
    if (!success) return setErrors(errs);
    setErrors({});
    setSaving(true);
    try {
      await userService.updateProfile(user.uid, data);
      await refreshProfile();
      toast.success(t('toasts.profileUpdated'));
    } catch (err) {
      toast.error(err?.message || t('toasts.saveError'));
    } finally {
      setSaving(false);
    }
    return undefined;
  };

  return (
    <div className="space-y-gutter max-w-2xl">
      <PageHeader title={t('profile.title')} subtitle={t('profile.subtitle')} />

      <Card className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full border border-primary/30 bg-surface-container flex items-center justify-center text-primary-fixed font-headline-lg">
          {initial}
        </div>
        <div className="min-w-0">
          <h3 className="font-headline-md text-headline-md text-on-surface truncate">
            {profile?.name || user?.displayName || t('profile.operator')}
          </h3>
          <p className="font-data-mono text-data-mono text-outline truncate">{user?.email}</p>
        </div>
      </Card>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <FormField label={t('profile.name')} htmlFor="p-name" error={errors.name} required>
            <Input id="p-name" value={values.name} onChange={(e) => setField('name', e.target.value)} error={errors.name} />
          </FormField>
          <FormField label={t('profile.email')} htmlFor="p-email" hint={t('profile.emailHint')}>
            <Input id="p-email" value={user?.email || ''} disabled className="opacity-60" />
          </FormField>
          <FormField label={t('profile.preferredCurrency')} htmlFor="p-currency" error={errors.currency}>
            <Select id="p-currency" value={values.currency} onChange={(e) => setField('currency', e.target.value)} options={CURRENCIES} />
          </FormField>
          <div className="pt-2">
            <Button type="submit" icon="save" loading={saving}>
              {t('common.saveChanges')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
