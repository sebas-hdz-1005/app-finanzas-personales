/**
 * Categorías base que se siembran para cada usuario nuevo.
 * Los iconos son nombres de Material Symbols Outlined (como en los diseños).
 */
export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Hogar', icon: 'home', color: '#7c6cf0' },
  { name: 'Alimentación', icon: 'shopping_cart', color: '#38a97e' },
  { name: 'Salud', icon: 'medical_services', color: '#e08a8a' },
  { name: 'Transporte', icon: 'commute', color: '#9b8cf5' },
  { name: 'Servicios', icon: 'electric_bolt', color: '#2f9e75' },
  { name: 'Entretenimiento', icon: 'sports_esports', color: '#6d5ce0' },
  { name: 'Deuda', icon: 'credit_card', color: '#f0a878' },
  { name: 'Otros', icon: 'more_horiz', color: '#a8a5bd' },
];

export const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Salario', icon: 'payments', color: '#38a97e' },
  { name: 'Inversiones', icon: 'trending_up', color: '#7c6cf0' },
  { name: 'Extra', icon: 'redeem', color: '#9b8cf5' },
];

/** Iconos disponibles para el selector de categorías. */
export const CATEGORY_ICONS = [
  'home', 'shopping_cart', 'medical_services', 'commute', 'electric_bolt',
  'sports_esports', 'credit_card', 'restaurant', 'flight', 'school',
  'fitness_center', 'pets', 'savings', 'payments', 'trending_up', 'redeem',
  'more_horiz', 'shopping_bag', 'local_cafe', 'phone_iphone',
];
