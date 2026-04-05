import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ClientsPage from '../../pages/ClientsPage';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';

vi.mock('../../components/Navbar', () => ({
  default: () => <div data-testid="navbar" />
}));

vi.mock('../../components/Sidebar', () => ({
  default: () => <div data-testid="sidebar" />
}));

vi.mock('../../components/Icon', () => ({
  default: () => <span data-testid="icon" />
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../../services/api', () => ({
  apiService: {
    clients: {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn()
    }
  }
}));

describe('ClientsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    apiService.clients.getAll.mockResolvedValue([
      {
        id: 'c1',
        name: 'Acme Biotech',
        email: 'contacto@acmebio.com',
        phoneNumber: '+57 300 123 4567',
        status: 'active',
        projectsCount: 2
      }
    ]);
  });

  it('muestra accion de registrar cliente para rol admin', async () => {
    useAuth.mockReturnValue({
      getUserRole: () => 'admin'
    });

    render(<ClientsPage />);

    expect(await screen.findByText('Acme Biotech')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Registrar nuevo cliente/i })).toBeInTheDocument();
  });

  it('oculta accion de registrar cliente para rol no admin', async () => {
    useAuth.mockReturnValue({
      getUserRole: () => 'researcher'
    });

    render(<ClientsPage />);

    expect(await screen.findByText('Acme Biotech')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Registrar nuevo cliente/i })).not.toBeInTheDocument();
  });

  it('valida nombre duplicado antes de crear cliente', async () => {
    const user = userEvent.setup();

    useAuth.mockReturnValue({
      getUserRole: () => 'admin'
    });

    render(<ClientsPage />);

    await screen.findByText('Acme Biotech');

    await user.click(screen.getByRole('button', { name: /Registrar nuevo cliente/i }));
    await user.type(screen.getByPlaceholderText(/Acme Biotech/i), 'Acme Biotech');
    await user.type(screen.getByPlaceholderText(/contacto@acmebio\.com/i), 'nuevo@acmebio.com');
    await user.click(screen.getByRole('button', { name: /Registrar cliente/i }));

    expect(await screen.findByText(/Ya existe un cliente registrado con ese nombre/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(apiService.clients.create).not.toHaveBeenCalled();
    });
  });
});
