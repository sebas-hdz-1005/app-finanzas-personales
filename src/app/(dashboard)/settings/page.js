'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useTranslation } from '@/i18n/LanguageProvider';
import { LanguageSwitch } from '@/components/layout/LanguageSwitch';
import { emitDataChanged } from '@/hooks/useDataChanged';
import { categoryService, seedUserData } from '@/services';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { CategoryForm } from '@/components/forms/CategoryForm';
import { LoadingState } from '@/components/common/Spinner';
import { useToast } from '@/components/common/Toast';
import { DATA_BACKEND } from '@/lib/backend';

export default function SettingsPage() {
  const { user, currency, logout } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const { data, loading } = useFinancialData();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await seedUserData(user.uid, { currency });
      emitDataChanged();
      toast.success(res.seeded ? t('toasts.demoLoaded') : t('toasts.demoCompleted'));
    } catch (err) {
      toast.error(err?.message || t('toasts.seedError'));
    } finally {
      setSeeding(false);
    }
  };

  const handleCategorySubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editing) {
        await categoryService.update(user.uid, editing.id, formData);
        toast.success(t('toasts.categoryUpdated'));
      } else {
        await categoryService.create(user.uid, formData);
        toast.success(t('toasts.categoryCreated'));
      }
      emitDataChanged();
      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      toast.error(err?.message || t('toasts.saveError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCategoryDelete = async () => {
    if (!deleting) return;
    setSubmitting(true);
    try {
      await categoryService.remove(user.uid, deleting.id);
      emitDataChanged();
      toast.success(t('toasts.categoryDeleted'));
      setDeleting(null);
    } catch (err) {
      toast.error(err?.message || t('toasts.deleteError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="space-y-gutter">
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      {/* Idioma */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="translate" className="text-primary-fixed" />
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-1">{t('settings.languageTitle')}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">{t('settings.languageDesc')}</p>
          </div>
        </div>
        <LanguageSwitch />
      </Card>

      {/* Info del sistema */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="dns" className="text-primary-fixed" />
          </div>
          <div>
            <p className="font-body-md text-on-surface">{t('settings.dataBackend')}</p>
            <p className="font-data-mono text-[12px] text-outline uppercase">
              {DATA_BACKEND === 'firebase' ? t('settings.backendFirebase') : t('settings.backendDemo')}
            </p>
          </div>
        </div>
        <Badge tone={DATA_BACKEND === 'firebase' ? 'success' : 'cyan'}>
          {DATA_BACKEND === 'firebase' ? t('settings.production') : t('settings.demoMode')}
        </Badge>
      </Card>

      {/* Datos demo */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-1">{t('settings.demoDataTitle')}</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">{t('settings.demoDataDesc')}</p>
        </div>
        <Button icon="database" onClick={handleSeed} loading={seeding}>
          {t('settings.loadDemoData')}
        </Button>
      </Card>

      {/* Categorías */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-headline-md text-headline-md text-on-surface">{t('settings.categories')}</h3>
          <Button
            variant="outline"
            size="sm"
            icon="add"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            {t('common.new')}
          </Button>
        </div>

        {loading ? (
          <LoadingState />
        ) : data.categories.length === 0 ? (
          <p className="text-outline font-body-md py-6 text-center">{t('settings.noCategories')}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-lg"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${cat.color}1a` }}
                >
                  <Icon name={cat.icon} style={{ color: cat.color }} className="text-[20px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-on-surface truncate">{cat.name}</p>
                  <p className="text-[10px] font-label-caps text-outline uppercase">
                    {cat.type === 'income' ? t('settings.income') : t('settings.expense')}
                  </p>
                </div>
                <button type="button" onClick={() => { setEditing(cat); setFormOpen(true); }} className="text-outline hover:text-primary-fixed" aria-label={`${t('common.edit')} ${cat.name}`}>
                  <Icon name="edit" className="text-[18px]" />
                </button>
                <button type="button" onClick={() => setDeleting(cat)} className="text-outline hover:text-error" aria-label={`${t('common.delete')} ${cat.name}`}>
                  <Icon name="delete" className="text-[18px]" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Sesión */}
      <Card accent="error" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-1">{t('settings.sessionTitle')}</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">{t('settings.sessionDesc')}</p>
        </div>
        <Button variant="danger" icon="logout" onClick={handleLogout}>
          {t('nav.logout')}
        </Button>
      </Card>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? t('settings.editCategory') : t('settings.newCategory')}>
        <CategoryForm initialValues={editing} onSubmit={handleCategorySubmit} onCancel={() => setFormOpen(false)} submitting={submitting} />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={handleCategoryDelete}
        title={t('settings.deleteCatTitle')}
        message={deleting ? t('settings.deleteCatMsg', { name: deleting.name }) : ''}
        loading={submitting}
      />
    </div>
  );
}
