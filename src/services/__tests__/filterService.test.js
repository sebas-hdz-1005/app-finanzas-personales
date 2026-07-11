import { filterTransactions, dateRangeFromPreset } from '@/services/filterService';

const categoriesById = new Map([
  ['c1', { id: 'c1', name: 'Hogar' }],
  ['c2', { id: 'c2', name: 'Comida' }],
]);

const txns = [
  { id: 't1', type: 'expense', title: 'Renta', categoryId: 'c1', status: 'confirmed', transactionDate: '2024-05-02' },
  { id: 't2', type: 'income', title: 'Nómina', categoryId: 'c2', status: 'confirmed', transactionDate: '2024-05-10' },
  { id: 't3', type: 'expense', title: 'Cena Bistro', categoryId: 'c2', status: 'pending', transactionDate: '2024-05-20' },
];

describe('filterTransactions', () => {
  it('filtra por tipo', () => {
    expect(filterTransactions(txns, { type: 'income' })).toHaveLength(1);
    expect(filterTransactions(txns, { type: 'expense' })).toHaveLength(2);
  });

  it('filtra por categoría', () => {
    expect(filterTransactions(txns, { categoryId: 'c2' })).toHaveLength(2);
  });

  it('busca por título', () => {
    const res = filterTransactions(txns, { search: 'renta' }, categoriesById);
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('t1');
  });

  it('busca por nombre de categoría', () => {
    const res = filterTransactions(txns, { search: 'comida' }, categoriesById);
    expect(res.map((t) => t.id).sort()).toEqual(['t2', 't3']);
  });

  it('filtra por rango de fechas', () => {
    const res = filterTransactions(txns, { from: '2024-05-05', to: '2024-05-15' });
    expect(res.map((t) => t.id)).toEqual(['t2']);
  });

  it('sin filtros devuelve todo', () => {
    expect(filterTransactions(txns, {})).toHaveLength(3);
  });
});

describe('dateRangeFromPreset', () => {
  it('genera rango de 30 días', () => {
    const ref = new Date('2024-05-31');
    const { from, to } = dateRangeFromPreset('30d', ref);
    expect(to).toBe('2024-05-31');
    expect(from).toBe('2024-05-01');
  });

  it('year empieza el 1 de enero', () => {
    const { from } = dateRangeFromPreset('year', new Date('2024-07-10'));
    expect(from).toBe('2024-01-01');
  });

  it('all devuelve rango vacío', () => {
    expect(dateRangeFromPreset('all')).toEqual({});
  });
});
