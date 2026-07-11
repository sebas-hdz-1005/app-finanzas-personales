import { createDemoRepository } from '@/repositories/demo/createDemoRepository';
import { clearStore } from '@/repositories/demo/store';

describe('createDemoRepository', () => {
  beforeEach(() => clearStore());

  it('crea, lista, obtiene, actualiza y elimina aislando por usuario', async () => {
    const repo = createDemoRepository('test_items');

    const created = await repo.create('u1', { name: 'A', amount: 10 });
    expect(created.id).toBeDefined();
    expect(created.userId).toBe('u1');
    expect(created.createdAt).toBeDefined();

    // Otro usuario no ve los datos de u1.
    await repo.create('u2', { name: 'B', amount: 20 });
    const u1Items = await repo.list('u1');
    expect(u1Items).toHaveLength(1);
    expect(u1Items[0].name).toBe('A');

    // get respeta el aislamiento por usuario.
    expect(await repo.get('u2', created.id)).toBeNull();
    expect((await repo.get('u1', created.id)).name).toBe('A');

    // update
    const updated = await repo.update('u1', created.id, { amount: 99 });
    expect(updated.amount).toBe(99);

    // remove
    await repo.remove('u1', created.id);
    expect(await repo.list('u1')).toHaveLength(0);
    // u2 sigue intacto
    expect(await repo.list('u2')).toHaveLength(1);
  });

  it('ordena por el campo indicado', async () => {
    const repo = createDemoRepository('test_ordered');
    await repo.create('u1', { name: 'first', order: 1 });
    await repo.create('u1', { name: 'second', order: 2 });
    const asc = await repo.list('u1', { orderBy: 'order', direction: 'asc' });
    expect(asc.map((i) => i.name)).toEqual(['first', 'second']);
    const desc = await repo.list('u1', { orderBy: 'order', direction: 'desc' });
    expect(desc.map((i) => i.name)).toEqual(['second', 'first']);
  });
});
