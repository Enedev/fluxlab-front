import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProjectsPage from '../../pages/ProjectsPage';
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

vi.mock('../../services/api', () => ({
  apiService: {
    projects: {
      getAll: vi.fn(),
      getAvailableStatuses: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn()
    },
    samples: {
      getRepository: vi.fn()
    },
    clients: {
      getAll: vi.fn()
    }
  }
}));

describe('ProjectsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    apiService.projects.getAll.mockResolvedValue([
      {
        id: 'P-001',
        name: 'Proyecto Alfa',
        client: { name: 'BioLabs' },
        status: 'active',
        samples: []
      }
    ]);

    apiService.samples.getRepository.mockResolvedValue([]);
    apiService.clients.getAll.mockResolvedValue([{ id: 'C-1', name: 'BioLabs' }]);
    apiService.projects.getAvailableStatuses.mockResolvedValue(['active']);
  });

  it('renderiza proyectos al cargar datos correctamente', async () => {
    render(<ProjectsPage />);

    expect(screen.getByRole('heading', { name: /Proyectos de Investigación/i })).toBeInTheDocument();
    expect(await screen.findByText('Proyecto Alfa')).toBeInTheDocument();

    await waitFor(() => {
      expect(apiService.projects.getAll).toHaveBeenCalledTimes(1);
      expect(apiService.samples.getRepository).toHaveBeenCalledTimes(1);
      expect(apiService.clients.getAll).toHaveBeenCalledTimes(1);
    });
  });

  it('muestra errores combinados cuando fallan multiples fuentes', async () => {
    apiService.projects.getAll.mockRejectedValue(new Error('Error proyectos'));
    apiService.samples.getRepository.mockRejectedValue(new Error('Error repositorio'));
    apiService.clients.getAll.mockResolvedValue([]);

    render(<ProjectsPage />);

    expect(await screen.findByText(/Error proyectos/i)).toBeInTheDocument();
    expect(screen.getByText(/Error repositorio/i)).toBeInTheDocument();
  });

  it('valida que el nombre de proyecto sea obligatorio al crear', async () => {
    const user = userEvent.setup();
    apiService.projects.getAll.mockResolvedValue([]);
    apiService.samples.getRepository.mockResolvedValue([]);

    render(<ProjectsPage />);

    await screen.findByText(/No se encontraron proyectos/i);
    await user.click(screen.getByRole('button', { name: /Crear Nuevo Proyecto/i }));
    await user.type(screen.getByPlaceholderText(/ej\. Sintesis Molecular Zeta/i), '   ');
    await user.click(screen.getByRole('button', { name: /Crear Proyecto/i }));

    expect(await screen.findByText(/El nombre del proyecto es obligatorio/i)).toBeInTheDocument();
    expect(apiService.projects.create).not.toHaveBeenCalled();
  });
});
