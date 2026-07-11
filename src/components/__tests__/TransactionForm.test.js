import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionForm } from '@/components/forms/TransactionForm';

const accounts = [{ id: 'a1', name: 'Cuenta Principal' }];
const categories = [
  { id: 'c1', name: 'Hogar', type: 'expense' },
  { id: 'c2', name: 'Salario', type: 'income' },
];

describe('TransactionForm', () => {
  it('muestra errores de validación y no envía si faltan campos', async () => {
    const onSubmit = jest.fn();
    render(
      <TransactionForm accounts={accounts} categories={categories} onSubmit={onSubmit} onCancel={() => {}} />,
    );

    await userEvent.click(screen.getByRole('button', { name: /registrar/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText(/el título es obligatorio/i)).toBeInTheDocument();
    // El mensaje de error es un <p role="alert"> (el placeholder del select comparte texto).
    expect(screen.getByText(/selecciona una categoría/i, { selector: 'p' })).toBeInTheDocument();
  });

  it('envía datos válidos con el monto convertido a número', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(
      <TransactionForm accounts={accounts} categories={categories} onSubmit={onSubmit} onCancel={() => {}} />,
    );

    await userEvent.type(screen.getByLabelText(/título/i), 'Renta mensual');
    await userEvent.type(screen.getByLabelText(/monto/i), '1500');
    await userEvent.selectOptions(screen.getByLabelText(/categoría/i), 'c1');

    await userEvent.click(screen.getByRole('button', { name: /registrar/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const payload = onSubmit.mock.calls[0][0];
    expect(payload).toMatchObject({
      type: 'expense',
      accountId: 'a1',
      categoryId: 'c1',
      title: 'Renta mensual',
      amount: 1500,
    });
  });

  it('filtra las categorías por el tipo seleccionado', async () => {
    render(
      <TransactionForm accounts={accounts} categories={categories} onSubmit={() => {}} onCancel={() => {}} />,
    );
    // Por defecto expense → sólo "Hogar" disponible.
    const select = screen.getByLabelText(/categoría/i);
    expect(select).toHaveTextContent('Hogar');
    expect(select).not.toHaveTextContent('Salario');

    // Cambiar a Ingreso → aparece "Salario".
    await userEvent.click(screen.getByRole('button', { name: 'Ingreso' }));
    expect(screen.getByLabelText(/categoría/i)).toHaveTextContent('Salario');
  });
});
