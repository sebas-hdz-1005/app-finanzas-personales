'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useTranslation } from '@/i18n/LanguageProvider';
import { emitDataChanged } from '@/hooks/useDataChanged';
import { transactionService } from '@/services';
import { filterTransactions, dateRangeFromPreset } from '@/services/filterService';
import { computeTotals, withRunningBalance, computeNetWorth } from '@/services/financeService';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { TransactionForm } from '@/components/forms/TransactionForm';
import { LedgerTable } from '@/components/tables/LedgerTable';
import { Pagination } from '@/components/tables/Pagination';
import { LoadingState } from '@/components/common/Spinner';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { useToast } from '@/components/common/Toast';
import { formatCurrency } from '@/utils/format';
import { downloadTransactionsCsv } from '@/utils/csv';

const PAGE_SIZE = 8;

export default function TransactionsPage() {
  const { user, currency } = useAuth();
  const { t } = useTranslation();
  const toast = useToast();
  const { data, loading, error, reload } = useFinancialData();

  const [filters, setFilters] = useState({ type: 'all', search: '', preset: '30d', categoryId: 'all' });
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const categoriesById = useMemo(
    () => new Map(data.categories.map((c) => [c.id, c])),
    [data.categories],
  );

  const filtered = useMemo(() => {
    const range = dateRangeFromPreset(filters.preset);
    return filterTransactions(
      data.transactions,
      { type: filters.type, search: filters.search, categoryId: filters.categoryId, ...range },
      categoriesById,
    );
  }, [data.transactions, filters, categoriesById]);

  const totals = useMemo(() => computeTotals(filtered), [filtered]);
  const netWorth = useMemo(
    () => computeNetWorth(data.accounts, data.transactions),
    [data.accounts, data.transactions],
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage = Math.min(page, Math.max(1, totalPages));
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const rowsWithBalance = withRunningBalance(pageRows, netWorth);

  const setFilter = (name, value) => {
    setFilters((f) => ({ ...f, [name]: value }));
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (tx) => {
    setEditing(tx);
    setFormOpen(true);
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editing) {
        await transactionService.update(user.uid, editing.id, formData);
        toast.success(t('toasts.txUpdated'));
      } else {
        await transactionService.create(user.uid, formData);
        toast.success(t('toasts.txCreated'));
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

  const handleDelete = async () => {
    if (!deleting) return;
    setSubmitting(true);
    try {
      await transactionService.remove(user.uid, deleting.id);
      emitDataChanged();
      toast.success(t('toasts.txDeleted'));
      setDeleting(null);
    } catch (err) {
      toast.error(err?.message || t('toasts.deleteError'));
    } finally {
      setSubmitting(false);
    }
  };

  const categoryOptions = [
    { value: 'all', label: t('transactions.allCategories') },
    ...data.categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="space-y-gutter">
      <PageHeader
        title={t('transactions.title')}
        subtitle={t('transactions.subtitle')}
        actions={
          <>
            <Button
              variant="ghost"
              icon="download"
              onClick={() => downloadTransactionsCsv(filtered, categoriesById)}
              disabled={filtered.length === 0}
            >
              {t('transactions.exportCsv')}
            </Button>
            <Button icon="add" onClick={openCreate}>
              {t('common.quickAdd')}
            </Button>
          </>
        }
      />

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        <Card className="md:col-span-3 p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <Input
            icon="search"
            placeholder={t('transactions.searchPlaceholder')}
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            className="font-data-mono"
            aria-label={t('transactions.searchAria')}
          />
          <div className="flex gap-2">
            <Select
              value={filters.type}
              onChange={(e) => setFilter('type', e.target.value)}
              options={[
                { value: 'all', label: t('transactions.typeAll') },
                { value: 'expense', label: t('transactions.typeExpense') },
                { value: 'income', label: t('transactions.typeIncome') },
              ]}
              aria-label={t('transactions.filterType')}
              className="py-2.5"
            />
            <Select
              value={filters.preset}
              onChange={(e) => setFilter('preset', e.target.value)}
              options={[
                { value: '30d', label: t('transactions.preset30d') },
                { value: 'quarter', label: t('transactions.presetQuarter') },
                { value: 'year', label: t('transactions.presetYear') },
                { value: 'all', label: t('transactions.presetAll') },
              ]}
              aria-label={t('transactions.filterDate')}
              className="py-2.5"
            />
          </div>
          <Select
            value={filters.categoryId}
            onChange={(e) => setFilter('categoryId', e.target.value)}
            options={categoryOptions}
            aria-label={t('transactions.filterCategory')}
            className="py-2.5 md:max-w-[200px]"
          />
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-label-caps font-label-caps text-outline mb-1">{t('transactions.filteredVolume')}</p>
            <p className="font-data-mono text-headline-md text-primary-fixed">
              {formatCurrency(totals.totalIncome + totals.totalExpense, currency)}
            </p>
          </div>
          <span className="material-symbols-outlined text-secondary-fixed text-headline-lg">monitoring</span>
        </Card>
      </div>

      {/* Tabla */}
      <Card className="p-0 overflow-hidden neon-glow">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState onRetry={reload} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="receipt_long"
            title={data.transactions.length === 0 ? t('transactions.emptyTitle') : t('transactions.noResultsTitle')}
            description={
              data.transactions.length === 0
                ? t('transactions.emptyDescNew')
                : t('transactions.emptyDescNoResults')
            }
            action={
              data.transactions.length === 0 ? (
                <Button icon="add" onClick={openCreate}>
                  {t('transactions.registerMovement')}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  icon="filter_alt_off"
                  onClick={() => setFilters({ type: 'all', search: '', preset: 'all', categoryId: 'all' })}
                >
                  {t('common.clearFilters')}
                </Button>
              )
            }
          />
        ) : (
          <>
            <LedgerTable
              rows={rowsWithBalance}
              categoriesById={categoriesById}
              onEdit={openEdit}
              onDelete={setDeleting}
            />
            <Pagination
              page={safePage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onChange={setPage}
            />
          </>
        )}
      </Card>

      {/* Modal crear/editar */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? t('transactions.editTransaction') : t('transactions.registerMovement')}
      >
        <TransactionForm
          accounts={data.accounts}
          categories={data.categories}
          initialValues={editing}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          submitting={submitting}
        />
      </Modal>

      {/* Confirmar eliminación */}
      <ConfirmDialog
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
        title={t('transactions.deleteTitle')}
        message={deleting ? t('transactions.deleteMsg', { title: deleting.title }) : ''}
        loading={submitting}
      />
    </div>
  );
}
