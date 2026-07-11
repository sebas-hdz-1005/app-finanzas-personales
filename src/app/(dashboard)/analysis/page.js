'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/AuthContext';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useTranslation } from '@/i18n/LanguageProvider';
import {
  computeMonthlyFlux,
  computeBudgetDrift,
  computeCategoryDistribution,
  computeTotals,
} from '@/services/financeService';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { ProgressBar } from '@/components/common/ProgressBar';
import { AreaLineChart } from '@/components/charts/AreaLineChart';
import { LoadingState } from '@/components/common/Spinner';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency } from '@/utils/format';
import { COLORS } from '@/constants/theme';

/** Recomendación simple basada en reglas sobre los datos del usuario. */
function buildInsight(distribution, totals, t) {
  if (distribution.length === 0) return t('analysis.insightNoData');
  const top = distribution[0];
  if (top.percent > 35) {
    return t('analysis.insightConcentration', { name: top.name, pct: top.percent.toFixed(0) });
  }
  if (totals.available < 0) return t('analysis.insightNegative');
  return t('analysis.insightBalanced', { name: top.name, pct: top.percent.toFixed(0) });
}

export default function AnalysisPage() {
  const { currency } = useAuth();
  const { t, months } = useTranslation();
  const { data, loading, error, reload } = useFinancialData();

  const model = useMemo(() => {
    const flux = computeMonthlyFlux(data.transactions, 6);
    const drift = computeBudgetDrift(data.budgets, data.transactions, data.categories);
    const distribution = computeCategoryDistribution(data.transactions, data.categories);
    const totals = computeTotals(data.transactions);
    const burnPerWeek = flux.length > 0 ? flux[flux.length - 1].expense / 4 : 0;
    const delta =
      flux.length >= 2 && flux[flux.length - 2].expense > 0
        ? ((flux[flux.length - 1].expense - flux[flux.length - 2].expense) / flux[flux.length - 2].expense) * 100
        : 0;
    return { flux, drift, distribution, totals, burnPerWeek, delta };
  }, [data]);

  if (loading) return <LoadingState label={t('analysis.syncing')} />;
  if (error) return <ErrorState onRetry={reload} />;

  const { flux, drift, distribution, totals, burnPerWeek, delta } = model;
  const hasData = data.transactions.length > 0;

  return (
    <div className="space-y-gutter">
      <PageHeader
        title={t('analysis.title')}
        subtitle={t('analysis.subtitle')}
        actions={
          <div className="flex gap-3">
            <Card className="py-3 px-5">
              <p className="font-label-caps text-[10px] text-outline uppercase">{t('analysis.netWorthDelta')}</p>
              <p className={`font-headline-md ${delta >= 0 ? 'text-primary-fixed' : 'text-error'}`}>
                {delta >= 0 ? '+' : ''}
                {delta.toFixed(1)}%
              </p>
            </Card>
            <Card accent="success" className="py-3 px-5">
              <p className="font-label-caps text-[10px] text-outline uppercase">{t('analysis.burnRate')}</p>
              <p className="font-headline-md text-secondary-fixed">
                {formatCurrency(burnPerWeek, currency, { compact: true })}
              </p>
            </Card>
          </div>
        }
      />

      {!hasData ? (
        <Card>
          <EmptyState
            icon="analytics"
            title={t('analysis.emptyTitle')}
            description={t('analysis.emptyDesc')}
            action={
              <Link href="/settings">
                <Button icon="database">{t('analysis.loadDemo')}</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            {/* Spending Flux */}
            <Card className="lg:col-span-2 min-h-[360px]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-headline-md text-headline-md text-on-surface">{t('analysis.spendingFlux')}</h4>
                  <p className="font-label-caps text-label-caps text-outline uppercase">
                    {t('analysis.velocityAnalysis')}
                  </p>
                </div>
              </div>
              <AreaLineChart
                points={flux.map((f) => ({ label: months[f.monthIndex], value: f.expense }))}
                color={COLORS.primaryFixedDim}
              />
            </Card>

            {/* Budget Drift */}
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-headline-md text-headline-md text-on-surface">{t('analysis.budgetDrift')}</h4>
                <Icon name="sync" className="text-primary-fixed-dim" />
              </div>
              {drift.length === 0 ? (
                <EmptyState
                  icon="donut_small"
                  title={t('analysis.noBudgets')}
                  description={t('analysis.noBudgetsDesc')}
                  action={
                    <Link href="/budgets">
                      <Button variant="outline" size="sm">
                        {t('analysis.goToBudgets')}
                      </Button>
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-5">
                  {drift.map((b) => (
                    <div key={b.id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                          {b.categoryName}
                        </span>
                        <span className={`font-data-mono text-data-mono ${b.breached ? 'text-error' : 'text-secondary-fixed'}`}>
                          {b.percent.toFixed(1)}%
                        </span>
                      </div>
                      <ProgressBar value={b.percent} tone={b.breached ? 'error' : b.percent > 80 ? 'cyan' : 'success'} />
                      {b.breached && (
                        <p className="text-[11px] text-error mt-1 flex items-center gap-1">
                          <Icon name="warning" className="text-[14px]" />{' '}
                          {t('analysis.thresholdExceeded', { amount: formatCurrency(b.spent - b.limit, currency) })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            {/* AI Synthesis (reglas) */}
            <Card className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon name="auto_awesome" className="text-primary-fixed" />
                </div>
                <div>
                  <h4 className="font-headline-md text-headline-md text-on-surface">{t('analysis.aiSynthesis')}</h4>
                  <p className="font-label-caps text-[10px] text-outline uppercase">{t('analysis.recommendationEngine')}</p>
                </div>
              </div>
              <div className="p-4 bg-white/5 border border-white/5 rounded-lg flex-1">
                <p className="font-label-caps text-label-caps text-primary-fixed mb-2 uppercase">
                  {t('analysis.optimizationProtocol')}
                </p>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {buildInsight(distribution, totals, t)}
                </p>
              </div>
            </Card>

            {/* Category Entropy */}
            <Card className="lg:col-span-2">
              <h4 className="font-headline-md text-headline-md text-on-surface mb-6">{t('analysis.categoryEntropy')}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {distribution.slice(0, 4).map((c) => (
                  <div key={c.categoryId} className="p-4 bg-white/5 border border-white/5 rounded-lg">
                    <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center mb-3">
                      <Icon name={c.icon} className="text-on-surface-variant text-[20px]" />
                    </div>
                    <p className="font-label-caps text-[10px] text-outline uppercase truncate">{c.name}</p>
                    <p className="font-data-mono text-on-surface">{formatCurrency(c.amount, currency, { compact: true })}</p>
                    <div className="mt-2">
                      <ProgressBar value={c.percent} tone="cyan" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
