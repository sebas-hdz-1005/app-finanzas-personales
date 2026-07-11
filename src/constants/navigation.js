/** Elementos de navegación principal (sidebar + mobile nav). `key` → clave i18n nav.* */
export const NAV_ITEMS = [
  { key: 'dashboard', href: '/dashboard', icon: 'dashboard' },
  { key: 'analysis', href: '/analysis', icon: 'analytics' },
  { key: 'wallets', href: '/wallets', icon: 'account_balance_wallet' },
  { key: 'transactions', href: '/transactions', icon: 'receipt_long' },
  { key: 'budgets', href: '/budgets', icon: 'donut_small' },
  { key: 'goals', href: '/goals', icon: 'flag' },
  { key: 'debts', href: '/debts', icon: 'credit_card' },
  { key: 'settings', href: '/settings', icon: 'settings' },
];

/** Enlaces del top nav (subconjunto destacado). */
export const TOP_NAV_ITEMS = [
  { key: 'dashboard', href: '/dashboard' },
  { key: 'analysis', href: '/analysis' },
  { key: 'wallets', href: '/wallets' },
  { key: 'transactions', href: '/transactions' },
];
