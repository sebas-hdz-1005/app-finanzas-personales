import { render, screen } from '@testing-library/react';
import { MoneyText } from '@/components/financial/MoneyText';

describe('MoneyText', () => {
  it('renderiza el monto formateado', () => {
    render(<MoneyText value={1234.5} currency="MXN" />);
    expect(screen.getByText(/1,234\.50/)).toBeInTheDocument();
  });

  it('aplica color de ingreso/gasto con tone auto', () => {
    const { container, rerender } = render(<MoneyText value={100} tone="auto" />);
    expect(container.firstChild).toHaveClass('text-secondary-fixed');
    rerender(<MoneyText value={-100} tone="auto" />);
    expect(container.firstChild).toHaveClass('text-error');
  });
});
