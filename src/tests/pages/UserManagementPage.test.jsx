import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UserManagementPage from '../../pages/UserManagementPage';
import { createUser, getAllUsers } from '../../services/userService';

vi.mock('../../components/Navbar', () => ({
  default: () => <div data-testid="navbar" />
}));

vi.mock('../../components/Sidebar', () => ({
  default: () => <div data-testid="sidebar" />
}));

vi.mock('../../components/Icon', () => ({
  default: () => <span data-testid="icon" />
}));

vi.mock('../../services/userService', () => ({
  createUser: vi.fn(),
  getAllUsers: vi.fn(),
  deleteUser: vi.fn(),
  updateUser: vi.fn()
}));

describe('UserManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAllUsers.mockResolvedValue([
      {
        id: 'u1',
        name: 'Ana Ruiz',
        email: 'ana@lab.com',
        role: 'technician',
        passwordChanged: true,
        last_sign_in_at: null
      }
    ]);
  });

  it('carga y muestra usuarios al iniciar', async () => {
    render(<UserManagementPage />);

    expect(screen.getByRole('heading', { name: /Gestión de Usuarios/i })).toBeInTheDocument();
    expect(await screen.findByText('Ana Ruiz')).toBeInTheDocument();

    await waitFor(() => {
      expect(getAllUsers).toHaveBeenCalledTimes(1);
    });
  });

  it('crea usuario y muestra modal con credenciales temporales', async () => {
    const user = userEvent.setup();

    createUser.mockResolvedValue({ temporaryPassword: 'TEMP-1234' });

    render(<UserManagementPage />);

    await screen.findByText('Ana Ruiz');

    await user.type(screen.getByPlaceholderText(/Ej: Dr\. Julian Pierce/i), 'Carlos Vega');
    await user.type(screen.getByPlaceholderText(/j\.pierce@emeraldlab\.io/i), 'carlos@lab.com');
    await user.click(screen.getByRole('button', { name: /Completar Registro/i }));

    await waitFor(() => {
      expect(createUser).toHaveBeenCalledWith({
        name: 'Carlos Vega',
        email: 'carlos@lab.com',
        role: 'technician'
      });
    });

    expect(await screen.findByText(/Usuario Creado Exitosamente/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('TEMP-1234')).toBeInTheDocument();
  });
});
