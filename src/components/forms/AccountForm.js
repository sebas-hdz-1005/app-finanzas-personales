'use client';

import { useState } from 'react';
import { FormField } from './FormField';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from '@/components/common/Button';
import { accountSchema } from '@/validations/finance';
import { validateWith } from '@/utils/validation';
import { CURRENCIES } from '@/constants';
import { useTranslation } from '@/i18n/LanguageProvider';
import { accountTypeOptions } from '@/i18n/options';

export function AccountForm({ initialValues, defaultCurrency = 'MXN', onSubmit, onCancel, submitting }) {
  const { t, lang } = useTranslation();
  const [values, setValues] = useState(() => ({
    name: initialValues?.name || '',
    type: initialValues?.type || 'checking',
    initialBalance: initialValues?.initialBalance != null ? String(initialValues.initialBalance) : '',
    currency: initialValues?.currency || defaultCurrency,
  }));
  const [errors, setErrors] = useState({});
  const setField = (n, v) => setValues((s) => ({ ...s, [n]: v }));

  const submit = async (e) => {
    e.preventDefault();
    const { success, data, errors: errs } = validateWith(accountSchema, values, lang);
    if (!success) return setErrors(errs);
    setErrors({});
    return onSubmit(data);
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <FormField label={t('forms.name')} htmlFor="acc-name" error={errors.name} required>
        <Input id="acc-name" value={values.name} onChange={(e) => setField('name', e.target.value)} placeholder={t('forms.accountNamePlaceholder')} error={errors.name} />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={t('forms.type')} htmlFor="acc-type" error={errors.type} required>
          <Select id="acc-type" value={values.type} onChange={(e) => setField('type', e.target.value)} options={accountTypeOptions(t)} />
        </FormField>
        <FormField label={t('forms.currency')} htmlFor="acc-currency" error={errors.currency}>
          <Select id="acc-currency" value={values.currency} onChange={(e) => setField('currency', e.target.value)} options={CURRENCIES} />
        </FormField>
      </div>
      <FormField label={t('forms.initialBalance')} htmlFor="acc-balance" error={errors.initialBalance} required>
        <Input id="acc-balance" type="number" step="0.01" inputMode="decimal" value={values.initialBalance} onChange={(e) => setField('initialBalance', e.target.value)} placeholder="0.00" error={errors.initialBalance} />
      </FormField>
      <div className="flex gap-3 pt-2">
        <Button variant="outline" fullWidth onClick={onCancel} type="button" disabled={submitting}>{t('common.cancel')}</Button>
        <Button variant="primary" fullWidth type="submit" loading={submitting}>{initialValues?.id ? t('common.save') : t('wallets.createAccount')}</Button>
      </div>
    </form>
  );
}
