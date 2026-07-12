import { z } from 'zod';

const money = z
  .union([z.number(), z.string()])
  .transform((v) => (typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''))))
  .pipe(z.number({ invalid_type_error: 'Monto inválido' }).finite());

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense'], { message: 'Tipo inválido' }),
  accountId: z.string().min(1, 'Selecciona una cuenta'),
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  title: z.string().trim().min(2, 'El título es obligatorio').max(120),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  amount: money.refine((v) => v > 0, 'El monto debe ser mayor a 0'),
  status: z.enum(['confirmed', 'pending']).default('confirmed'),
  transactionDate: z.string().min(1, 'La fecha es obligatoria'),
});

export const accountSchema = z.object({
  name: z.string().trim().min(2, 'El nombre es obligatorio').max(60),
  type: z.enum(['checking', 'savings', 'credit', 'cash', 'investment']),
  initialBalance: money,
  currency: z.string().min(3).max(3).default('MXN'),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'El nombre es obligatorio').max(40),
  type: z.enum(['income', 'expense']),
  icon: z.string().min(1).default('more_horiz'),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/, 'Color inválido')
    .default('#a8a5bd'),
});

export const budgetSchema = z.object({
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  limitAmount: money.refine((v) => v > 0, 'El límite debe ser mayor a 0'),
  period: z.enum(['monthly', 'weekly', 'yearly']).default('monthly'),
  startDate: z.string().min(1, 'La fecha de inicio es obligatoria'),
  endDate: z.string().optional().or(z.literal('')),
});

export const goalSchema = z.object({
  name: z.string().trim().min(2, 'El nombre es obligatorio').max(60),
  targetAmount: money.refine((v) => v > 0, 'La meta debe ser mayor a 0'),
  currentAmount: money.refine((v) => v >= 0, 'No puede ser negativo').default(0),
  targetDate: z.string().min(1, 'La fecha objetivo es obligatoria'),
  status: z.enum(['active', 'completed', 'paused']).default('active'),
});

const positiveInt = z
  .union([z.number(), z.string()])
  .transform((v) => Math.floor(typeof v === 'number' ? v : parseInt(String(v), 10)))
  .pipe(z.number({ invalid_type_error: 'Valor inválido' }).int().min(1, 'Debe ser al menos 1'));

const optionalDay = z
  .union([z.number(), z.string()])
  .optional()
  .transform((v) => {
    if (v === '' || v == null) return null;
    const n = Math.floor(Number(v));
    return Number.isFinite(n) ? n : null;
  })
  .refine((v) => v === null || (v >= 1 && v <= 31), 'Día inválido (1-31)');

export const debtSchema = z.object({
  name: z.string().trim().min(2, 'El nombre es obligatorio').max(60),
  type: z.enum(['credit_card', 'loan', 'mortgage', 'personal', 'other']).default('credit_card'),
  accountId: z.string().optional().or(z.literal('')),
  initialAmount: money.refine((v) => v > 0, 'El monto inicial debe ser mayor a 0'),
  currentAmount: money.refine((v) => v >= 0, 'No puede ser negativo'),
  installments: positiveInt,
  interestRate: money.refine((v) => v >= 0, 'No puede ser negativo').default(0),
  paymentDay: optionalDay,
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'El nombre es obligatorio').max(80),
  currency: z.string().min(3).max(3),
});
