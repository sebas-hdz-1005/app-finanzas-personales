'use client';

import { useState, useMemo } from 'react';
import { FormField } from './FormField';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { debtSchema } from '@/validations/finance';
import { validateWith } from '@/utils/validation';
import { useTranslation } from '@/i18n/LanguageProvider';
import { useAuth } from '@/features/auth/AuthContext';
import { debtTypeOptions } from '@/i18n/options';
import { computeDebtPlan } from '@/services/financeService';
import { formatCurrency, formatDate } from '@/utils/format';

export function DebtForm({ accounts = [], initialValues, onSubmit, onCancel, submitting }) {
  const { t, lang } = useTranslation();
  const { currency } = useAuth();
  const [values, setValues] = useState(() => ({
    name: initialValues?.name || '',
    type: initialValues?.type || 'credit_card',
    accountId: initialValues?.accountId || '',
    initialAmount: initialValues?.initialAmount != null ? String(initialValues.initialAmount) : '',
    currentAmount: initialValues?.currentAmount != null ? String(initialValues.currentAmount) : '',
    installments: initialValues?.installments != null ? String(initialValues.installments) : '',
    interestRate: initialValues?.interestRate != null ? String(initialValues.interestRate) : '0',
    paymentDay: initialValues?.paymentDay != null ? String(initialValues.paymentDay) : '',
  }));
  const [errors, setErrors] = useState({});
  const setField = (n, v) => setValues((s) => ({ ...s, [n]: v }));

  // Vista previa: cuota mensual y fecha de liquidación calculadas.
  const preview = useMemo(() => {
    const current = parseFloat(values.currentAmount || values.initialAmount || '0');
    const installments = parseInt(values.installments || '0', 10);
    if (!current || !installments) return null;
    return computeDebtPlan({
      currentAmount: current,
      initialAmount: parseFloat(values.initialAmount || '0') || current,
      installments,
      interestRate: parseFloat(values.interestRate || '0'),
      paymentDay: values.paymentDay,
    });
  }, [values]);

  const submit = async (e) => {
    e.preventDefault();
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

      <FormField label={t('forms.debtAccount')} htmlFor="debt-account" error={errors.accountId} hint={t('forms.debtAccountHint')}>
        <Select
          id="debt-account"
          value={values.accountId}
          onChange={(e) => setField('accountId', e.target.value)}
          options={[{ value: '', label: t('forms.debtAccountNone') }, ...accounts.map((a) => ({ value: a.id, label: a.name }))]}
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={t('forms.initialAmount')} htmlFor="debt-initial" error={errors.initialAmount} required>
          <Input id="debt-initial" type="number" step="0.01" inputMode="decimal" value={values.initialAmount} onChange={(e) => setField('initialAmount', e.target.value)} placeholder="0.00" error={errors.initialAmount} />
        </FormField>
        <FormField label={t('forms.currentAmount')} htmlFor="debt-current" error={errors.currentAmount}>
          <Input id="debt-current" type="number" step="0.01" inputMode="decimal" value={values.currentAmount} onChange={(e) => setField('currentAmount', e.target.value)} placeholder="0.00" error={errors.currentAmount} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label={t('forms.installments')} htmlFor="debt-installments" error={errors.installments} required>
          <Input id="debt-installments" type="number" step="1" min="1" inputMode="numeric" value={values.installments} onChange={(e) => setField('installments', e.target.value)} placeholder="12" error={errors.installments} />
        </FormField>
        <FormField label={t('forms.interestRate')} htmlFor="debt-interest" error={errors.interestRate}>
          <Input id="debt-interest" type="number" step="0.01" inputMode="decimal" value={values.interestRate} onChange={(e) => setField('interestRate', e.target.value)} placeholder="0" error={errors.interestRate} />
        </FormField>
        <FormField label={t('forms.paymentDay')} htmlFor="debt-day" error={errors.paymentDay} hint={t('forms.paymentDayHint')}>
          <Input id="debt-day" type="number" step="1" min="1" max="31" inputMode="numeric" value={values.paymentDay} onChange={(e) => setField('paymentDay', e.target.value)} placeholder="15" error={errors.paymentDay} />
        </FormField>
      </div>

      {/* Vista previa de la cuota calculada */}
      {preview && (
        <div className="rounded-lg bg-primary/10 px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-1">
          <span className="flex items-center gap-2 text-primary-fixed">
            <Icon name="calculate" className="text-[18px]" />
            <span className="font-label-caps text-label-caps uppercase">{t('forms.estimatedPayment')}</span>
            <span className="font-data-mono text-on-surface">{formatCurrency(preview.payment, currency)}</span>
          </span>
          {preview.payoffDate && (
            <span className="font-data-mono text-[12px] text-outline">
              {t('debts.payoffDate', { date: formatDate(preview.payoffDate) })}
            </span>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="outline" fullWidth onClick={onCancel} type="button" disabled={submitting}>{t('common.cancel')}</Button>
        <Button variant="primary" fullWidth type="submit" loading={submitting}>{initialValues?.id ? t('common.save') : t('debts.createDebt')}</Button>
      </div>
    </form>
  );
}
