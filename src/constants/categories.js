/**
 * Categorías base que se siembran para cada usuario nuevo.
 * Los iconos son nombres de Material Symbols Outlined (como en los diseños).
 */
export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Hogar', icon: 'home', color: '#00dbe7' },
  { name: 'Alimentación', icon: 'shopping_cart', color: '#c3f400' },
  { name: 'Salud', icon: 'medical_services', color: '#ffb4ab' },
  { name: 'Transporte', icon: 'commute', color: '#74f5ff' },
  { name: 'Servicios', icon: 'electric_bolt', color: '#abd600' },
  { name: 'Entretenimiento', icon: 'sports_esports', color: '#00f2ff' },
  { name: 'Deuda', icon: 'credit_card', color: '#ffb3ac' },
  { name: 'Otros', icon: 'more_horiz', color: '#849495' },
];

export const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Salario', icon: 'payments', color: '#c3f400' },
  { name: 'Inversiones', icon: 'trending_up', color: '#00dbe7' },
  { name: 'Extra', icon: 'redeem', color: '#74f5ff' },
];

/** Iconos disponibles para el selector de categorías. */
export const CATEGORY_ICONS = [
  'home', 'shopping_cart', 'medical_services', 'commute', 'electric_bolt',
  'sports_esports', 'credit_card', 'restaurant', 'flight', 'school',
  'fitness_center', 'pets', 'savings', 'payments', 'trending_up', 'redeem',
  'more_horiz', 'shopping_bag', 'local_cafe', 'phone_iphone',
];
