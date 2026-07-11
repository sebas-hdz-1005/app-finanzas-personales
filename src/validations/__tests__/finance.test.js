import { transactionSchema, accountSchema, goalSchema } from '@/validations/finance';
import { loginSchema, registerSchema } from '@/validations/auth';

describe('transactionSchema', () => {
  const valid = {
    type: 'expense',
    accountId: 'a1',
    categoryId: 'c1',
    title: 'Renta',
    amount: '1500.50',
    status: 'confirmed',
    transactionDate: '2024-05-01',
  };

  it('acepta una transacción válida y convierte el monto a número', () => {
    const res = transactionSchema.safeParse(valid);
    expect(res.success).toBe(true);
    expect(res.data.amount).toBe(1500.5);
  });

  it('rechaza monto <= 0', () => {
    expect(transactionSchema.safeParse({ ...valid, amount: '0' }).success).toBe(false);
    expect(transactionSchema.safeParse({ ...valid, amount: '-5' }).success).toBe(false);
  });

  it('rechaza título vacío y cuenta faltante', () => {
    expect(transactionSchema.safeParse({ ...valid, title: '' }).success).toBe(false);
    expect(transactionSchema.safeParse({ ...valid, accountId: '' }).success).toBe(false);
  });

  it('rechaza tipo inválido', () => {
    expect(transactionSchema.safeParse({ ...valid, type: 'transfer' }).success).toBe(false);
  });
});

describe('accountSchema', () => {
  it('valida cuenta correcta', () => {
    const res = accountSchema.safeParse({
      name: 'Banco',
      type: 'checking',
      initialBalance: '1000',
      currency: 'MXN',
    });
    expect(res.success).toBe(true);
    expect(res.data.initialBalance).toBe(1000);
  });
});

describe('goalSchema', () => {
  it('rechaza meta <= 0', () => {
    expect(
      goalSchema.safeParse({ name: 'Fondo', targetAmount: '0', currentAmount: '0', targetDate: '2024-12-31' }).success,
    ).toBe(false);
  });
});

describe('loginSchema / registerSchema', () => {
  it('valida email y contraseña', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '123456' }).success).toBe(true);
    expect(loginSchema.safeParse({ email: 'no-email', password: '123456' }).success).toBe(false);
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '12' }).success).toBe(false);
  });

  it('registro exige contraseñas coincidentes', () => {
    const base = { name: 'Ana', email: 'a@b.com', password: '123456' };
    expect(registerSchema.safeParse({ ...base, confirmPassword: '123456' }).success).toBe(true);
    expect(registerSchema.safeParse({ ...base, confirmPassword: 'xxxxxx' }).success).toBe(false);
  });
});
