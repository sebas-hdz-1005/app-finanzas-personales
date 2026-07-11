'use client';

import { useState } from 'react';
import { FormField } from './FormField';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from '@/components/common/Button';
import { budgetSchema } from '@/validations/finance';
import { validateWith } from '@/utils/validation';
import { todayISODate } from '@/utils/format';
import { useTranslation } from '@/i18n/LanguageProvider';
import { budgetPeriodOptions } from '@/i18n/options';

export function BudgetForm({ categories = [], initialValues, onSubmit, onCancel, submitting }) {
  const { t, lang } = useTranslation();
  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const [values, setValues] = useState(() => ({
    categoryId: initialValues?.categoryId || expenseCategories[0]?.id || '',
    limitAmount: initialValues?.limitAmount != null ? String(initialValues.limitAmount) : '',
    period: initialValues?.period || 'monthly',
    startDate: initialValues?.startDate || todayISODate(),
    endDate: initialValues?.endDate || '',
  }));
  const [errors, setErrors] = useState({});
  const setField = (n, v) => setValues((s) => ({ ...s, [n]: v }));

  const submit = async (e) => {
    e.preventDefault();
    const { success, data, errors: errs } = validateWith(budgetSchema, values, lang);
    if (!success) return setErrors(errs);
    setErrors({});
    return onSubmit(data);
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {expenseCategories.length === 0 && <p className="text-error text-body-md">{t('forms.needExpenseCat')}</p>}
      <FormField label={t('forms.category')} htmlFor="bud-cat" error={errors.categoryId} required>
        <Select id="bud-cat" value={values.categoryId} onChange={(e) => setField('categoryId', e.target.value)} options={expenseCategories.map((c) => ({ value: c.id, label: c.name }))} placeholder={t('forms.selectCategory')} error={errors.categoryId} />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={t('forms.limit')} htmlFor="bud-limit" error={errors.limitAmount} required>
          <Input id="bud-limit" type="number" step="0.01" inputMode="decimal" value={values.limitAmount} onChange={(e) => setField('limitAmount', e.target.value)} placeholder="0.00" error={errors.limitAmount} />
        </FormField>
        <FormField label={t('forms.period')} htmlFor="bud-period" error={errors.period}>
          <Select id="bud-period" value={values.period} onChange={(e) => setField('period', e.target.value)} options={budgetPeriodOptions(t)} />
        </FormField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={t('forms.start')} htmlFor="bud-start" error={errors.startDate} required>
          <Input id="bud-start" type="date" value={values.startDate} onChange={(e) => setField('startDate', e.target.value)} error={errors.startDate} />
        </FormField>
        <FormField label={t('forms.endOptional')} htmlFor="bud-end" error={errors.endDate}>
          <Input id="bud-end" type="date" value={values.endDate} onChange={(e) => setField('endDate', e.target.value)} />
        </FormField>
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="outline" fullWidth onClick={onCancel} type="button" disabled={submitting}>{t('common.cancel')}</Button>
        <Button variant="primary" fullWidth type="submit" loading={submitting} disabled={expenseCategories.length === 0}>{initialValues?.id ? t('common.save') : t('budgets.createBudget')}</Button>
      </div>
    </form>
  );
}
