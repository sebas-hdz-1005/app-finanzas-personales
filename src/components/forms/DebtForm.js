'use client';

import { useState } from 'react';
import { FormField } from './FormField';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from '@/components/common/Button';
import { debtSchema } from '@/validations/finance';
import { validateWith } from '@/utils/validation';
import { useTranslation } from '@/i18n/LanguageProvider';
import { debtTypeOptions } from '@/i18n/options';

export function DebtForm({ initialValues, onSubmit, onCancel, submitting }) {
  const { t, lang } = useTranslation();
  const [values, setValues] = useState(() => ({
    name: initialValues?.name || '',
    type: initialValues?.type || 'credit_card',
    initialAmount: initialValues?.initialAmount != null ? String(initialValues.initialAmount) : '',
    currentAmount: initialValues?.currentAmount != null ? String(initialValues.currentAmount) : '',
    monthlyPayment: initialValues?.monthlyPayment != null ? String(initialValues.monthlyPayment) : '',
    interestRate: initialValues?.interestRate != null ? String(initialValues.interestRate) : '0',
  }));
  const [errors, setErrors] = useState({});
  const setField = (n, v) => setValues((s) => ({ ...s, [n]: v }));

  const submit = async (e) => {
    e.preventDefault();
    // Si no se indicó saldo actual, se asume igual al inicial.
    const payload = { ...values };
    if (payload.currentAmount === '') payload.currentAmount = payload.initialAmount;
    const { success, data, errors: errs } = validateWith(debtSchema, payload, lang);
    if (!success) return setErrors(errs);
    setErrors({});
    return onSubmit(data);
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={t('forms.debtName')} htmlFor="debt-name" error={errors.name} required>
          <Input id="debt-name" value={values.name} onChange={(e) => setField('name', e.target.value)} placeholder={t('forms.debtNamePlaceholder')} error={errors.name} />
        </FormField>
        <FormField label={t('forms.debtType')} htmlFor="debt-type" error={errors.type}>
          <Select id="debt-type" value={values.type} onChange={(e) => setField('type', e.target.value)} options={debtTypeOptions(t)} />
        </FormField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={t('forms.initialAmount')} htmlFor="debt-initial" error={errors.initialAmount} required>
          <Input id="debt-initial" type="number" step="0.01" inputMode="decimal" value={values.initialAmount} onChange={(e) => setField('initialAmount', e.target.value)} placeholder="0.00" error={errors.initialAmount} />
        </FormField>
        <FormField label={t('forms.currentAmount')} htmlFor="debt-current" error={errors.currentAmount}>
          <Input id="debt-current" type="number" step="0.01" inputMode="decimal" value={values.currentAmount} onChange={(e) => setField('currentAmount', e.target.value)} placeholder="0.00" error={errors.currentAmount} />
        </FormField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={t('forms.monthlyPayment')} htmlFor="debt-payment" error={errors.monthlyPayment} required>
          <Input id="debt-payment" type="number" step="0.01" inputMode="decimal" value={values.monthlyPayment} onChange={(e) => setField('monthlyPayment', e.target.value)} placeholder="0.00" error={errors.monthlyPayment} />
        </FormField>
        <FormField label={t('forms.interestRate')} htmlFor="debt-interest" error={errors.interestRate}>
          <Input id="debt-interest" type="number" step="0.01" inputMode="decimal" value={values.interestRate} onChange={(e) => setField('interestRate', e.target.value)} placeholder="0" error={errors.interestRate} />
        </FormField>
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="outline" fullWidth onClick={onCancel} type="button" disabled={submitting}>{t('common.cancel')}</Button>
        <Button variant="primary" fullWidth type="submit" loading={submitting}>{initialValues?.id ? t('common.save') : t('debts.createDebt')}</Button>
      </div>
    </form>
  );
}
