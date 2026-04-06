import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SamplesPage from '../../pages/SamplesPage';

vi.mock('../../components/Navbar', () => ({
  default: () => <div data-testid="navbar" />
}));

vi.mock('../../components/Sidebar', () => ({
  default: () => <div data-testid="sidebar" />
}));

vi.mock('../../components/SamplesTable', () => ({
  default: () => <div>Tabla de muestras</div>
}));

vi.mock('../../components/TemplatesTable', () => ({
  default: () => <div>Tabla de plantillas</div>
}));

describe('SamplesPage', () => {
  it('muestra la pestana de muestras por defecto', () => {
    render(<SamplesPage />);

    expect(screen.getByRole('button', { name: 'Muestras' })).toBeInTheDocument();
    expect(screen.getByText('Tabla de muestras')).toBeInTheDocument();
    expect(screen.queryByText('Tabla de plantillas')).not.toBeInTheDocument();
  });

  it('cambia a la pestana de plantillas al hacer click', async () => {
    const user = userEvent.setup();

    render(<SamplesPage />);

    await user.click(screen.getByRole('button', { name: 'Plantillas' }));

    expect(screen.getByText('Tabla de plantillas')).toBeInTheDocument();
    expect(screen.queryByText('Tabla de muestras')).not.toBeInTheDocument();
  });
});
