'use client';

import { useState } from 'react';
import { FormField } from './FormField';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from '@/components/common/Button';
import { goalSchema } from '@/validations/finance';
import { validateWith } from '@/utils/validation';
import { todayISODate } from '@/utils/format';
import { useTranslation } from '@/i18n/LanguageProvider';
import { goalStatusOptions } from '@/i18n/options';

export function GoalForm({ initialValues, onSubmit, onCancel, submitting }) {
  const { t, lang } = useTranslation();
  const [values, setValues] = useState(() => ({
    name: initialValues?.name || '',
    targetAmount: initialValues?.targetAmount != null ? String(initialValues.targetAmount) : '',
    currentAmount: initialValues?.currentAmount != null ? String(initialValues.currentAmount) : '0',
    targetDate: initialValues?.targetDate || todayISODate(),
    status: initialValues?.status || 'active',
  }));
  const [errors, setErrors] = useState({});
  const setField = (n, v) => setValues((s) => ({ ...s, [n]: v }));

  const submit = async (e) => {
    e.preventDefault();
    const { success, data, errors: errs } = validateWith(goalSchema, values, lang);
    if (!success) return setErrors(errs);
    setErrors({});
    return onSubmit(data);
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <FormField label={t('forms.goalName')} htmlFor="goal-name" error={errors.name} required>
        <Input id="goal-name" value={values.name} onChange={(e) => setField('name', e.target.value)} placeholder={t('forms.goalNamePlaceholder')} error={errors.name} />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={t('forms.target')} htmlFor="goal-target" error={errors.targetAmount} required>
          <Input id="goal-target" type="number" step="0.01" inputMode="decimal" value={values.targetAmount} onChange={(e) => setField('targetAmount', e.target.value)} placeholder="0.00" error={errors.targetAmount} />
        </FormField>
        <FormField label={t('forms.saved')} htmlFor="goal-current" error={errors.currentAmount}>
          <Input id="goal-current" type="number" step="0.01" inputMode="decimal" value={values.currentAmount} onChange={(e) => setField('currentAmount', e.target.value)} placeholder="0.00" error={errors.currentAmount} />
        </FormField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={t('forms.targetDate')} htmlFor="goal-date" error={errors.targetDate} required>
          <Input id="goal-date" type="date" value={values.targetDate} onChange={(e) => setField('targetDate', e.target.value)} error={errors.targetDate} />
        </FormField>
        <FormField label={t('forms.status')} htmlFor="goal-status" error={errors.status}>
          <Select id="goal-status" value={values.status} onChange={(e) => setField('status', e.target.value)} options={goalStatusOptions(t)} />
        </FormField>
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="outline" fullWidth onClick={onCancel} type="button" disabled={submitting}>{t('common.cancel')}</Button>
        <Button variant="primary" fullWidth type="submit" loading={submitting}>{initialValues?.id ? t('common.save') : t('goals.createGoal')}</Button>
      </div>
    </form>
  );
}
