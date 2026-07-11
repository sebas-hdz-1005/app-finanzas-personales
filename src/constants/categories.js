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

/** Iconos disponibles para el selector de categorías (Material Symbols). */
export const CATEGORY_ICONS = [
  // Hogar / vivienda
  'home', 'apartment', 'cottage', 'bed', 'chair', 'cleaning_services',
  // Comida
  'restaurant', 'local_cafe', 'local_bar', 'fastfood', 'local_grocery_store', 'shopping_cart',
  // Salud / bienestar
  'medical_services', 'medication', 'fitness_center', 'spa', 'self_improvement', 'child_care',
  // Transporte
  'commute', 'directions_car', 'directions_bus', 'train', 'flight', 'local_gas_station',
  // Servicios / tecnología
  'electric_bolt', 'water_drop', 'wifi', 'phone_iphone', 'devices', 'router',
  // Ocio / educación
  'sports_esports', 'movie', 'music_note', 'sports_soccer', 'school', 'menu_book',
  // Compras / regalos
  'shopping_bag', 'checkroom', 'redeem', 'card_giftcard', 'celebration', 'pets',
  // Finanzas / trabajo
  'savings', 'payments', 'trending_up', 'account_balance', 'credit_card', 'work',
  // Viajes / otros
  'luggage', 'hotel', 'beach_access', 'park', 'volunteer_activism', 'more_horiz',
];
