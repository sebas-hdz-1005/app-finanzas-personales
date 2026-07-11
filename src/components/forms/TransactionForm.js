'use client';

import { useState, useMemo } from 'react';
import { FormField } from './FormField';
import { Input, Textarea } from './Input';
import { Select } from './Select';
import { Button } from '@/components/common/Button';
import { transactionSchema } from '@/validations/finance';
import { validateWith } from '@/utils/validation';
import { todayISODate } from '@/utils/format';
import { useTranslation } from '@/i18n/LanguageProvider';
import { transactionTypeOptions, transactionStatusOptions } from '@/i18n/options';

/**
 * Formulario de creación/edición de transacción con validación (cliente).
 * @param {object} props
 * @param {Array} props.accounts
 * @param {Array} props.categories
 * @param {object} [props.initialValues]
 * @param {(data:object)=>Promise<void>} props.onSubmit
 * @param {()=>void} props.onCancel
 * @param {boolean} [props.submitting]
 */
export function TransactionForm({
  accounts = [],
  categories = [],
  initialValues,
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const { t, lang } = useTranslation();
  const [values, setValues] = useState(() => ({
    type: initialValues?.type || 'expense',
    accountId: initialValues?.accountId || accounts[0]?.id || '',
    categoryId: initialValues?.categoryId || '',
    title: initialValues?.title || '',
    description: initialValues?.description || '',
    amount: initialValues?.amount != null ? String(initialValues.amount) : '',
    status: initialValues?.status || 'confirmed',
    transactionDate: initialValues?.transactionDate || todayISODate(),
  }));
  const [errors, setErrors] = useState({});

  const setField = (name, value) => setValues((v) => ({ ...v, [name]: value }));

  // Categorías filtradas por el tipo seleccionado.
  const categoryOptions = useMemo(
    () =>
      categories
        .filter((c) => c.type === values.type)
        .map((c) => ({ value: c.id, label: c.name })),
    [categories, values.type],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { success, data, errors: errs } = validateWith(transactionSchema, values, lang);
    if (!success) {
      setErrors(errs);
      return;
    }
    setErrors({});
    await onSubmit(data);
  };

  const noAccounts = accounts.length === 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {noAccounts && <p className="text-error text-body-md">{t('forms.needAccount')}</p>}

      {/* Tipo (segmented) */}
      <div className="grid grid-cols-2 gap-2">
        {transactionTypeOptions(t).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setField('type', opt.value)}
            className={
              values.type === opt.value
                ? 'py-2.5 rounded-lg font-label-caps text-label-caps border border-primary-fixed text-primary-fixed bg-primary/10'
                : 'py-2.5 rounded-lg font-label-caps text-label-caps border border-black/10 text-outline hover:bg-black/5'
            }
            aria-pressed={values.type === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <FormField label={t('forms.txTitle')} htmlFor="tx-title" error={errors.title} required>
        <Input
          id="tx-title"
          value={values.title}
          onChange={(e) => setField('title', e.target.value)}
          placeholder={t('forms.txTitlePlaceholder')}
          error={errors.title}
          maxLength={120}
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={t('forms.amount')} htmlFor="tx-amount" error={errors.amount} required>
          <Input
            id="tx-amount"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            value={values.amount}
            onChange={(e) => setField('amount', e.target.value)}
            placeholder={t('forms.amountPlaceholder')}
            error={errors.amount}
          />
        </FormField>
        <FormField label={t('forms.date')} htmlFor="tx-date" error={errors.transactionDate} required>
          <Input
            id="tx-date"
            type="date"
            value={values.transactionDate}
            onChange={(e) => setField('transactionDate', e.target.value)}
            error={errors.transactionDate}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={t('forms.account')} htmlFor="tx-account" error={errors.accountId} required>
          <Select
            id="tx-account"
            value={values.accountId}
            onChange={(e) => setField('accountId', e.target.value)}
            options={accounts.map((a) => ({ value: a.id, label: a.name }))}
            placeholder={t('forms.selectAccount')}
            error={errors.accountId}
          />
        </FormField>
        <FormField label={t('forms.category')} htmlFor="tx-category" error={errors.categoryId} required>
          <Select
            id="tx-category"
            value={values.categoryId}
            onChange={(e) => setField('categoryId', e.target.value)}
            options={categoryOptions}
            placeholder={t('forms.selectCategory')}
            error={errors.categoryId}
          />
        </FormField>
      </div>

      <FormField label={t('forms.status')} htmlFor="tx-status" error={errors.status}>
        <Select
          id="tx-status"
          value={values.status}
          onChange={(e) => setField('status', e.target.value)}
          options={transactionStatusOptions(t)}
        />
      </FormField>

      <FormField label={t('forms.descriptionOptional')} htmlFor="tx-desc" error={errors.description}>
        <Textarea
          id="tx-desc"
          value={values.description}
          onChange={(e) => setField('description', e.target.value)}
          placeholder={t('forms.notesPlaceholder')}
          maxLength={500}
        />
      </FormField>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" fullWidth onClick={onCancel} type="button" disabled={submitting}>
          {t('common.cancel')}
        </Button>
        <Button variant="primary" fullWidth type="submit" loading={submitting} disabled={noAccounts}>
          {initialValues?.id ? t('common.saveChanges') : t('forms.register')}
        </Button>
      </div>
    </form>
  );
}
