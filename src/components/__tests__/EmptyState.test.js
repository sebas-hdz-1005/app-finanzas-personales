import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import userEvent from '@testing-library/user-event';

describe('EmptyState', () => {
  it('muestra título y descripción', () => {
    render(<EmptyState title="Sin datos" description="Nada por aquí" />);
    expect(screen.getByText('Sin datos')).toBeInTheDocument();
    expect(screen.getByText('Nada por aquí')).toBeInTheDocument();
  });
});

describe('ErrorState', () => {
  it('renderiza como alerta y dispara reintento', async () => {
    const onRetry = jest.fn();
    render(<ErrorState onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
