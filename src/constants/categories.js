/**
 * Categorías base que se siembran para cada usuario nuevo.
 * Los iconos son nombres de Material Symbols Outlined (como en los diseños).
 */
export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Hogar', icon: 'home', color: '#7c6cf0' },
  { name: 'Alimentación', icon: 'shopping_cart', color: '#59b85f' },
  { name: 'Salud', icon: 'medical_services', color: '#e0728c' },
  { name: 'Transporte', icon: 'commute', color: '#4aa3e0' },
  { name: 'Servicios', icon: 'electric_bolt', color: '#e0a53f' },
  { name: 'Entretenimiento', icon: 'sports_esports', color: '#9b6dd6' },
  { name: 'Deuda', icon: 'credit_card', color: '#e07a5f' },
  { name: 'Otros', icon: 'more_horiz', color: '#7c8aa5' },
];

export const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Salario', icon: 'payments', color: '#2fae9e' },
  { name: 'Inversiones', icon: 'trending_up', color: '#26a5b8' },
  { name: 'Extra', icon: 'redeem', color: '#e06fb0' },
];

/** Iconos disponibles para el selector de categorías. */
export const CATEGORY_ICONS = [
  'home', 'shopping_cart', 'medical_services', 'commute', 'electric_bolt',
  'sports_esports', 'credit_card', 'restaurant', 'flight', 'school',
  'fitness_center', 'pets', 'savings', 'payments', 'trending_up', 'redeem',
  'more_horiz', 'shopping_bag', 'local_cafe', 'phone_iphone',
];
