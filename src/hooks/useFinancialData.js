'use client';

// La lógica vive ahora en el provider (fuente única de datos compartida).
// Se re-exporta el hook aquí para no cambiar los imports existentes.
export { useFinancialData } from '@/features/data/FinancialDataProvider';
