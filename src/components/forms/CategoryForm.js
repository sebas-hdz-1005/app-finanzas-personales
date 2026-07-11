'use client';

import { useState } from 'react';
import { FormField } from './FormField';
import { Input } from './Input';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { cn } from '@/utils/cn';
import { categorySchema } from '@/validations/finance';
import { validateWith } from '@/utils/validation';
import { CATEGORY_ICONS } from '@/constants/categories';
import { CHART_PALETTE } from '@/constants/theme';
import { useTranslation } from '@/i18n/LanguageProvider';
import { transactionTypeOptions } from '@/i18n/options';

export function CategoryForm({ initialValues, onSubmit, onCancel, submitting }) {
  const { t, lang } = useTranslation();
  const [values, setValues] = useState(() => ({
    name: initialValues?.name || '',
    type: initialValues?.type || 'expense',
    icon: initialValues?.icon || 'more_horiz',
    color: initialValues?.color || CHART_PALETTE[0],
  }));
  const [errors, setErrors] = useState({});
  const setField = (n, v) => setValues((s) => ({ ...s, [n]: v }));

  const submit = async (e) => {
    e.preventDefault();
    const { success, data, errors: errs } = validateWith(categorySchema, values, lang);
    if (!success) return setErrors(errs);
    setErrors({});
    return onSubmit(data);
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="grid grid-cols-2 gap-2">
        {transactionTypeOptions(t).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setField('type', opt.value)}
            aria-pressed={values.type === opt.value}
            className={cn(
              'py-2.5 rounded-lg font-label-caps text-label-caps border',
              values.type === opt.value
                ? 'border-primary-fixed text-primary-fixed bg-primary/10'
                : 'border-black/10 text-outline hover:bg-black/5',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <FormField label={t('forms.name')} htmlFor="cat-name" error={errors.name} required>
        <Input id="cat-name" value={values.name} onChange={(e) => setField('name', e.target.value)} placeholder={t('forms.categoryNamePlaceholder')} error={errors.name} />
      </FormField>

      <FormField label={t('forms.icon')} htmlFor="cat-icon" error={errors.icon}>
        <div className="grid grid-cols-8 gap-2" id="cat-icon">
          {CATEGORY_ICONS.map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => setField('icon', ic)}
              aria-label={ic}
              aria-pressed={values.icon === ic}
              className={cn(
                'aspect-square flex items-center justify-center rounded-lg border transition-colors',
                values.icon === ic ? 'border-primary-fixed bg-primary/10 text-primary-fixed' : 'border-black/10 text-outline hover:bg-black/5',
              )}
            >
              <Icon name={ic} className="text-[20px]" />
            </button>
          ))}
        </div>
      </FormField>

      <FormField label={t('forms.color')} htmlFor="cat-color" error={errors.color}>
        <div className="flex flex-wrap gap-2" id="cat-color">
          {CHART_PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setField('color', c)}
              aria-label={`Color ${c}`}
              aria-pressed={values.color === c}
              className={cn('w-8 h-8 rounded-full border-2', values.color === c ? 'border-white' : 'border-transparent')}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </FormField>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" fullWidth onClick={onCancel} type="button" disabled={submitting}>{t('common.cancel')}</Button>
        <Button variant="primary" fullWidth type="submit" loading={submitting}>{initialValues?.id ? t('common.save') : t('settings.newCategory')}</Button>
      </div>
    </form>
  );
}
