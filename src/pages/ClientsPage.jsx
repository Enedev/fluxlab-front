/**
 * Clients Page
 *
 * Manage and view clients with backend integration.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  faEllipsisVertical,
  faPenToSquare,
  faTrashCan,
  faTriangleExclamation,
  faUsers,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import Navbar from '../components/Navbar';
import Icon from '../components/Icon';
import Sidebar from '../components/Sidebar';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Paginacion de clientes (temporalmente deshabilitada)
// const ITEMS_PER_PAGE = 10;

// Filtro por estado (temporalmente deshabilitado)
// const STATUS_OPTIONS = [
//   { value: 'all', label: 'Estado: Todos' },
//   { value: 'active', label: 'Activo' },
//   { value: 'inactive', label: 'Inactivo' }
// ];

const INITIAL_CLIENT_FORM = {
  name: '',
  email: '',
  phoneNumber: '',
  status: 'active',
  address: ''
};

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeClientStatus(value) {
  const raw = String(value || 'active').trim().toLowerCase();
  return raw === 'inactive' ? 'inactive' : 'active';
}

function getStatusLabel(status) {
  return status === 'inactive' ? 'INACTIVO' : 'ACTIVO';
}

function getStatusBadgeClasses(status) {
  if (status === 'inactive') {
    return 'text-red-700 bg-red-50 border border-red-100';
  }
  return 'text-emerald-700 bg-emerald-50 border border-emerald-100';
}

function parseClientsResponse(payload) {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      total: payload.length
    };
  }

  const list =
    (Array.isArray(payload?.data) && payload.data) ||
    (Array.isArray(payload?.clients) && payload.clients) ||
    (Array.isArray(payload?.items) && payload.items) ||
    [];

  const total =
    toNumber(payload?.total, NaN) ||
    toNumber(payload?.meta?.total, NaN) ||
    toNumber(payload?.count, NaN);

  return {
    items: list,
    total: Number.isFinite(total) ? total : list.length
  };
}

function normalizeClient(rawClient, index) {
  const id =
    rawClient?.id ||
    rawClient?._id ||
    rawClient?.uuid ||
    `client-${index + 1}`;

  const name =
    rawClient?.name ||
    rawClient?.clientName ||
    rawClient?.companyName ||
    rawClient?.organization ||
    `Cliente ${index + 1}`;

  return {
    id,
    displayId: String(id),
    name,
    email: rawClient?.email || rawClient?.contactEmail || '-',
    phoneNumber: rawClient?.phoneNumber || rawClient?.phone_number || '-',
    status: normalizeClientStatus(rawClient?.status),
    address: rawClient?.address || '',
    projectsCount: toNumber(
      rawClient?.projectsCount ??
        rawClient?.activeProjects ??
        rawClient?.active_projects ??
        rawClient?.projects?.length,
      0
    )
  };
}

function normalizeClientName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function hasDuplicatedClientName(clientList, candidateName, excludedClientId = null) {
  const normalizedCandidateName = normalizeClientName(candidateName);

  if (!normalizedCandidateName) {
    return false;
  }

  return clientList.some((client) => {
    if (excludedClientId && client.id === excludedClientId) {
      return false;
    }

    return normalizeClientName(client.name) === normalizedCandidateName;
  });
}

function sanitizePhoneInput(value) {
  const withoutInvalidCharacters = String(value || '').replace(/[^\d+\-()\s]/g, '');

  if (withoutInvalidCharacters.startsWith('+')) {
    return `+${withoutInvalidCharacters.slice(1).replace(/\+/g, '')}`;
  }

  return withoutInvalidCharacters.replace(/\+/g, '');
}

function isValidPhoneNumber(value) {
  const trimmedValue = String(value || '').trim();

  if (!trimmedValue) {
    return true;
  }

  const normalizedValue = trimmedValue.replace(/[\s\-()]/g, '');

  if (!/^\+?\d+$/.test(normalizedValue)) {
    return false;
  }

  const digitsOnly = normalizedValue.startsWith('+')
    ? normalizedValue.slice(1)
    : normalizedValue;

  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

export default function ClientsPage() {
  const { getUserRole } = useAuth();
  const canRegisterClients = getUserRole() === 'admin';
  const canManageClientActions = canRegisterClients;
  const tableColumnCount = canManageClientActions ? 6 : 5;

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Barra de busqueda de clientes (temporalmente deshabilitada)
  // const [searchTerm, setSearchTerm] = useState('');
  // Filtro por estado (temporalmente deshabilitado)
  // const [statusFilter, setStatusFilter] = useState('all');
  // Paginacion de clientes (temporalmente deshabilitada)
  // const [currentPage, setCurrentPage] = useState(1);
  const [totalClientsFromApi, setTotalClientsFromApi] = useState(0);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createClientForm, setCreateClientForm] = useState(INITIAL_CLIENT_FORM);
  const [createClientError, setCreateClientError] = useState('');
  const [creatingClient, setCreatingClient] = useState(false);

  const [actionMenuClientId, setActionMenuClientId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [deletingClientId, setDeletingClientId] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [editClientForm, setEditClientForm] = useState(INITIAL_CLIENT_FORM);
  const [editClientError, setEditClientError] = useState('');
  const [updatingClient, setUpdatingClient] = useState(false);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiService.clients.getAll();
      const { items, total } = parseClientsResponse(response);
      const normalizedClients = items.map((item, index) => normalizeClient(item, index));

      setClients(normalizedClients);
      setTotalClientsFromApi(total);
    } catch (err) {
      const errorMessage = String(err?.message || 'No fue posible cargar clientes.');
      if (errorMessage.toLowerCase().includes('401') || errorMessage.toLowerCase().includes('unauthorized')) {
        setError('Tu sesion no esta autorizada para /api/clients. Inicia sesion nuevamente.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients = useMemo(() => {
    // Logica de busqueda por texto (temporalmente deshabilitada)
    // const term = searchTerm.trim().toLowerCase();
    // return clients.filter((client) =>
    //   !term ||
    //   client.name.toLowerCase().includes(term) ||
    //   client.email.toLowerCase().includes(term) ||
    //   client.phoneNumber.toLowerCase().includes(term) ||
    //   client.displayId.toLowerCase().includes(term) ||
    //   client.address.toLowerCase().includes(term)
    // );

    // Filtro por estado (temporalmente deshabilitado)
    // return clients.filter((client) =>
    //   statusFilter === 'all' || client.status === statusFilter
    // );

    return clients;
  }, [clients]);

  // Paginacion de clientes (temporalmente deshabilitada)
  // const totalPages = Math.max(1, Math.ceil(filteredClients.length / ITEMS_PER_PAGE));
  // const safeCurrentPage = Math.min(currentPage, totalPages);
  // const paginatedClients = useMemo(() => {
  //   const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  //   return filteredClients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  // }, [filteredClients, safeCurrentPage]);
  // const pageButtons = useMemo(() => {
  //   const pages = [];
  //   const start = Math.max(1, safeCurrentPage - 2);
  //   const end = Math.min(totalPages, start + 4);
  //
  //   for (let page = start; page <= end; page += 1) {
  //     pages.push(page);
  //   }
  //
  //   return pages;
  // }, [safeCurrentPage, totalPages]);

  const stats = useMemo(() => {
    const totalVisible = totalClientsFromApi || clients.length;
    const activeClients = clients.filter((client) => client.status === 'active').length;
    const inactiveClients = clients.filter((client) => client.status === 'inactive').length;
    const projectsTotal = clients.reduce((sum, client) => sum + client.projectsCount, 0);

    return {
      totalVisible,
      activeClients,
      inactiveClients,
      projectsTotal
    };
  }, [clients, totalClientsFromApi]);

  const handleCreateClientInputChange = (event) => {
    const { name, value } = event.target;

    const nextValue = name === 'phoneNumber' ? sanitizePhoneInput(value) : value;

    setCreateClientForm((previousForm) => ({
      ...previousForm,
      [name]: nextValue
    }));
  };

  const handleEditClientInputChange = (event) => {
    const { name, value } = event.target;

    const nextValue = name === 'phoneNumber' ? sanitizePhoneInput(value) : value;

    setEditClientForm((previousForm) => ({
      ...previousForm,
      [name]: nextValue
    }));
  };

  const handleCreateClient = async (event) => {
    event.preventDefault();

    if (!canRegisterClients) {
      setCreateClientError('Solo administradores pueden registrar clientes.');
      return;
    }

    const clientName = createClientForm.name.trim();
    const phoneNumber = createClientForm.phoneNumber.trim();

    if (hasDuplicatedClientName(clients, clientName)) {
      setCreateClientError('Ya existe un cliente registrado con ese nombre.');
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      setCreateClientError('Ingresa un numero de telefono valido (7 a 15 digitos, con + opcional).');
      return;
    }

    setCreateClientError('');
    setCreatingClient(true);

    try {
      const payload = {
        name: clientName,
        email: createClientForm.email.trim(),
        phoneNumber: phoneNumber || undefined,
        status: createClientForm.status,
        address: createClientForm.address.trim() || undefined
      };

      await apiService.clients.create(payload);

      setShowCreateModal(false);
      setCreateClientForm(INITIAL_CLIENT_FORM);
      await loadClients();
    } catch (err) {
      const errorMessage = String(err?.message || 'No fue posible registrar el cliente.');

      if (errorMessage.toLowerCase().includes('401') || errorMessage.toLowerCase().includes('unauthorized')) {
        setCreateClientError('Solicitud no autorizada. Inicia sesion e intenta nuevamente.');
      } else {
        setCreateClientError(errorMessage);
      }
    } finally {
      setCreatingClient(false);
    }
  };

  const openEditModal = (client) => {
    if (!canManageClientActions) {
      return;
    }

    setActionMenuClientId(null);
    setEditingClient(client);
    setEditClientError('');
    setEditClientForm({
      name: client.name || '',
      email: client.email === '-' ? '' : client.email,
      phoneNumber: client.phoneNumber === '-' ? '' : client.phoneNumber,
      status: client.status || 'active',
      address: client.address || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateClient = async (event) => {
    event.preventDefault();

    if (!canManageClientActions) {
      setEditClientError('Solo administradores pueden editar clientes.');
      return;
    }

    if (!editingClient?.id) {
      return;
    }

    const clientName = editClientForm.name.trim();
    const phoneNumber = editClientForm.phoneNumber.trim();

    if (hasDuplicatedClientName(clients, clientName, editingClient.id)) {
      setEditClientError('Ya existe un cliente registrado con ese nombre.');
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      setEditClientError('Ingresa un numero de telefono valido (7 a 15 digitos, con + opcional).');
      return;
    }

    setUpdatingClient(true);
    setEditClientError('');

    try {
      const payload = {
        name: clientName,
        email: editClientForm.email.trim(),
        phoneNumber: phoneNumber || undefined,
        status: editClientForm.status,
        address: editClientForm.address.trim() || undefined
      };

      await apiService.clients.update(editingClient.id, payload);

      setShowEditModal(false);
      setEditingClient(null);
      await loadClients();
    } catch (err) {
      const errorMessage = String(err?.message || 'No fue posible actualizar el cliente.');
      setEditClientError(errorMessage);
    } finally {
      setUpdatingClient(false);
    }
  };

  const handleDeleteClient = (client) => {
    if (!canManageClientActions) {
      return;
    }

    setActionMenuClientId(null);
    setClientToDelete(client);
    setShowDeleteModal(true);
  };

  const confirmDeleteClient = async () => {
    if (!canManageClientActions) {
      setError('Solo administradores pueden eliminar clientes.');
      setShowDeleteModal(false);
      setClientToDelete(null);
      return;
    }

    if (!clientToDelete) {
      return;
    }

    const deletingId = clientToDelete.id;

    try {
      setDeletingClientId(deletingId);
      await apiService.clients.remove(deletingId, true);
      await loadClients();
      setShowDeleteModal(false);
      setClientToDelete(null);
    } catch (err) {
      const errorMessage = String(err?.message || 'No fue posible eliminar el cliente.');
      setError(errorMessage);
      setShowDeleteModal(false);
    } finally {
      setDeletingClientId(null);
      setClientToDelete(null);
    }
  };

  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={tableColumnCount} className="px-6 py-14">
            <div className="flex items-center justify-center">
              <p className="text-gray-500">Cargando clientes...</p>
            </div>
          </td>
        </tr>
      );
    }

    if (!filteredClients.length) {
      return (
        <tr>
          <td colSpan={tableColumnCount} className="px-6 py-14 text-center">
            <p className="text-gray-500 font-medium">No se encontraron clientes con los filtros seleccionados.</p>
            <p className="text-sm text-gray-400 mt-1">Ajusta la busqueda o registra un cliente nuevo.</p>
          </td>
        </tr>
      );
    }

    return filteredClients.map((client) => (
      <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-semibold">
              {client.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{client.name}</p>
              <p className="text-xs text-gray-500">ID: {client.displayId}</p>
            </div>
          </div>
        </td>

        <td className="px-6 py-4 text-sm text-gray-700">{client.email}</td>
        <td className="px-6 py-4 text-sm text-gray-700">{client.phoneNumber}</td>
        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{client.projectsCount}</td>

        <td className="px-6 py-4 text-sm">
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClasses(client.status)}`}>
            <span>{client.status === 'inactive' ? '●' : '●'}</span>
            {getStatusLabel(client.status)}
          </span>
        </td>

        {canManageClientActions && (
          <td className="px-6 py-4 text-sm text-right">
            <div className="relative inline-block text-left">
              <button
                type="button"
                className="inline-flex items-center justify-center !p-0 w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                onClick={() => {
                  setActionMenuClientId((previousId) =>
                    previousId === client.id ? null : client.id
                  );
                }}
                title="Acciones del cliente"
              >
                <Icon icon={faEllipsisVertical} size={14} color="currentColor" />
              </button>

              {actionMenuClientId === client.id && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => openEditModal(client)}
                    className="w-full px-4 py-2 text-left text-sm text-blue-700 hover:bg-blue-50"
                  >
                    <span className="inline-flex items-center gap-1">
                      <Icon icon={faPenToSquare} size={12} color="currentColor" />
                      Editar
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClient(client)}
                    disabled={deletingClientId === client.id}
                    className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 disabled:opacity-60"
                  >
                    {deletingClientId === client.id ? (
                      'Eliminando...'
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <Icon icon={faTrashCan} size={12} color="currentColor" />
                        Eliminar
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </td>
        )}
      </tr>
    ));
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Clientes</h1>
                <p className="text-gray-600 mt-1">
                  Gestiona laboratorios asociados y entidades registradas en la plataforma.
                </p>
              </div>

              {canRegisterClients && (
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center justify-center gap-2 !bg-emerald-500 hover:!bg-emerald-600 !text-gray-900 font-semibold !px-5 !py-3 rounded-lg transition"
                >
                  <Icon icon={faUsers} size={14} color="currentColor" />
                  Registrar nuevo cliente
                </button>
              )}
            </div>

            {error && (
              <div className="mt-6 p-4 rounded-lg border border-red-200 bg-red-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm text-red-700 font-medium">{error}</p>
                <button
                  type="button"
                  onClick={loadClients}
                  className="inline-flex items-center justify-center text-sm bg-white border border-red-200 text-red-700 px-3 py-1 rounded hover:bg-red-100"
                >
                  Reintentar
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
              <article className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm border-l-4 border-l-emerald-500">
                <p className="text-xs tracking-widest font-semibold text-gray-500 uppercase">Total de clientes</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalVisible}</p>
                <p className="text-sm text-gray-500 mt-2">Registros totales del sistema</p>
              </article>

              <article className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <p className="text-xs tracking-widest font-semibold text-gray-500 uppercase">Clientes activos</p>
                <p className="text-4xl font-bold text-emerald-700 mt-2">{stats.activeClients}</p>
                <p className="text-sm text-gray-500 mt-2">Con estado activo</p>
              </article>

              <article className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <p className="text-xs tracking-widest font-semibold text-gray-500 uppercase">Clientes inactivos</p>
                <p className="text-4xl font-bold text-red-700 mt-2">{stats.inactiveClients}</p>
                <p className="text-sm text-gray-500 mt-2">Con estado inactivo</p>
              </article>

              <article className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm border-l-4 border-l-gray-400">
                <p className="text-xs tracking-widest font-semibold text-gray-500 uppercase">Proyectos asociados</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{stats.projectsTotal}</p>
                <p className="text-sm text-gray-500 mt-2">Suma de proyectos por cliente</p>
              </article>
            </div>

            <section className="mt-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Barra de busqueda de clientes (temporalmente deshabilitada) */}
                  {/*
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Buscar por nombre, correo, telefono o ID"
                      className="w-full sm:w-80 px-10 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">ICONO_BUSCAR</span>
                  </div>
                  */}

                  {/* Filtro por estado (temporalmente deshabilitado) */}
                  {/*
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  */}
                </div>

                {/* Texto de conteo de clientes (temporalmente deshabilitado) */}
                {/*
                <p className="text-sm text-gray-500">
                  Mostrando {filteredClients.length} de {stats.totalVisible} clientes
                </p>
                */}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold tracking-widest text-gray-500 uppercase">Cliente e ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold tracking-widest text-gray-500 uppercase">Correo electronico</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold tracking-widest text-gray-500 uppercase">Telefono</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold tracking-widest text-gray-500 uppercase">Proyectos</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold tracking-widest text-gray-500 uppercase">Estado</th>
                      {canManageClientActions && (
                        <th className="px-6 py-4 text-right text-xs font-semibold tracking-widest text-gray-500 uppercase">Acciones</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>{renderTableBody()}</tbody>
                </table>
              </div>

              {/* Paginacion de clientes (temporalmente deshabilitada) */}
              {/*
              <div className="px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((previousPage) => Math.max(previousPage - 1, 1))}
                    disabled={safeCurrentPage === 1}
                    className="inline-flex items-center justify-center !p-0 w-8 h-8 border border-gray-300 rounded text-gray-700 leading-none hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ‹
                  </button>

                  {pageButtons.map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`inline-flex items-center justify-center !p-0 w-8 h-8 rounded text-sm leading-none border transition ${
                        page === safeCurrentPage
                          ? '!bg-emerald-500 !text-gray-900 border-emerald-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((previousPage) => Math.min(previousPage + 1, totalPages))}
                    disabled={safeCurrentPage === totalPages}
                    className="inline-flex items-center justify-center !p-0 w-8 h-8 border border-gray-300 rounded text-gray-700 leading-none hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ›
                  </button>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Ir a pagina:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={safeCurrentPage}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      if (!Number.isNaN(value)) {
                        setCurrentPage(Math.min(Math.max(value, 1), totalPages));
                      }
                    }}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-gray-700"
                  />
                </div>
              </div>
              */}
            </section>

            <div className="mt-6 border-t border-gray-200 pt-4 text-xs text-gray-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                {loading ? 'SINCRONIZANDO CLIENTES...' : 'SISTEMA EN LINEA'}
              </p>
            </div>
          </div>
        </main>
      </div>

      {showCreateModal && canRegisterClients && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-xl bg-white rounded-xl border border-gray-200 shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Registrar nuevo cliente</h2>
                <p className="text-sm text-gray-500 mt-1">Completa la informacion para crear un cliente.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="inline-flex items-center justify-center !p-0 w-8 h-8 rounded-lg text-lg leading-none text-gray-600 hover:bg-gray-100"
              >
                <Icon icon={faXmark} size={16} color="currentColor" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="px-6 py-5 space-y-4">
              {createClientError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {createClientError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del cliente</label>
                <input
                  type="text"
                  name="name"
                  value={createClientForm.name}
                  onChange={handleCreateClientInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Acme Biotech"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo electronico</label>
                <input
                  type="email"
                  name="email"
                  value={createClientForm.email}
                  onChange={handleCreateClientInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="contacto@acmebio.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefono (opcional)</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={createClientForm.phoneNumber}
                  onChange={handleCreateClientInputChange}
                  inputMode="tel"
                  pattern="^\\+?[0-9\\s\\-()]{7,20}$"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="+57 300 123 4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  name="status"
                  value={createClientForm.status}
                  onChange={handleCreateClientInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Direccion (opcional)</label>
                <input
                  type="text"
                  name="address"
                  value={createClientForm.address}
                  onChange={handleCreateClientInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Avenida Siempre Viva 742"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingClient}
                  className="inline-flex items-center justify-center !bg-emerald-500 hover:!bg-emerald-600 disabled:!bg-emerald-300 !text-gray-900 px-4 py-2 font-semibold rounded-lg"
                >
                  {creatingClient ? 'Guardando...' : 'Registrar cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {canManageClientActions && showEditModal && editingClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-xl bg-white rounded-xl border border-gray-200 shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Editar cliente</h2>
                <p className="text-sm text-gray-500 mt-1">Actualiza la informacion del cliente seleccionado.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingClient(null);
                }}
                className="inline-flex items-center justify-center !p-0 w-8 h-8 rounded-lg text-lg leading-none text-gray-600 hover:bg-gray-100"
              >
                <Icon icon={faXmark} size={16} color="currentColor" />
              </button>
            </div>

            <form onSubmit={handleUpdateClient} className="px-6 py-5 space-y-4">
              {editClientError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {editClientError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del cliente</label>
                <input
                  type="text"
                  name="name"
                  value={editClientForm.name}
                  onChange={handleEditClientInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo electronico</label>
                <input
                  type="email"
                  name="email"
                  value={editClientForm.email}
                  onChange={handleEditClientInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefono (opcional)</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={editClientForm.phoneNumber}
                  onChange={handleEditClientInputChange}
                  inputMode="tel"
                  pattern="^\\+?[0-9\\s\\-()]{7,20}$"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  name="status"
                  value={editClientForm.status}
                  onChange={handleEditClientInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Direccion (opcional)</label>
                <input
                  type="text"
                  name="address"
                  value={editClientForm.address}
                  onChange={handleEditClientInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingClient(null);
                  }}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updatingClient}
                  className="inline-flex items-center justify-center !bg-emerald-500 hover:!bg-emerald-600 disabled:!bg-emerald-300 !text-gray-900 px-4 py-2 font-semibold rounded-lg"
                >
                  {updatingClient ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {canManageClientActions && showDeleteModal && clientToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4 text-xl">
              <Icon icon={faTriangleExclamation} size={20} color="currentColor" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar cliente?</h3>
            <p className="text-gray-500 mb-6 leading-relaxed">
              Esta acción no se puede deshacer. Los proyectos que estén vinculados a {clientToDelete.name} no se eliminarán, pero sí quedarán sin cliente asociado.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={confirmDeleteClient}
                disabled={deletingClientId === clientToDelete.id}
                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-3 rounded-xl font-bold transition-all"
              >
                {deletingClientId === clientToDelete.id
                  ? 'Eliminando...'
                  : 'Sí, eliminar definitivamente'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setClientToDelete(null);
                }}
                className="w-full text-gray-500 px-4 py-3 font-bold hover:bg-gray-50 rounded-xl transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
