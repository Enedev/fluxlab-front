/**
 * Clients Page
 * 
 * Manage and view clients
 * Ready for backend data integration
 */

import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { apiService } from '../services/api';

const ITEMS_PER_PAGE = 10;

const SECTOR_OPTIONS = [
  { value: 'all', label: 'Sector: All' },
  { value: 'pharmaceutical', label: 'Pharmaceutical' },
  { value: 'environmental', label: 'Environmental' },
  { value: 'biotechnology', label: 'Biotechnology' },
  { value: 'public health', label: 'Public Health' }
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Status: All' },
  { value: 'COMPLIANT', label: 'Compliant' },
  { value: 'AUDIT PENDING', label: 'Audit Pending' },
  { value: 'NON-COMPLIANT', label: 'Non-Compliant' }
];

const INITIAL_CLIENT_FORM = {
  name: '',
  clientId: '',
  sector: 'pharmaceutical',
  contactEmail: ''
};

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeComplianceStatus(value) {
  const raw = String(value || '').trim().toLowerCase();

  if (!raw) return 'COMPLIANT';
  if (raw.includes('pending') || raw.includes('audit') || raw.includes('review')) {
    return 'AUDIT PENDING';
  }
  if (raw.includes('non') || raw.includes('fail') || raw.includes('overdue')) {
    return 'NON-COMPLIANT';
  }
  return 'COMPLIANT';
}

function normalizeSector(value) {
  const sector = String(value || 'General').trim();
  return sector || 'General';
}

function normalizeClient(rawClient, index) {
  const id = rawClient?.id || rawClient?._id || rawClient?.uuid || rawClient?.clientId || rawClient?.client_id || `client-${index + 1}`;

  const name =
    rawClient?.name ||
    rawClient?.clientName ||
    rawClient?.companyName ||
    rawClient?.organization ||
    `Client ${index + 1}`;

  const clientId =
    rawClient?.clientId ||
    rawClient?.client_id ||
    rawClient?.code ||
    rawClient?.identifier ||
    `CL-${String(index + 1).padStart(4, '0')}`;

  const sector = normalizeSector(
    rawClient?.sector || rawClient?.industrySector || rawClient?.industry || rawClient?.category
  );

  const activeProjects = toNumber(
    rawClient?.activeProjects ?? rawClient?.active_projects ?? rawClient?.projectsCount,
    0
  );

  const complianceRate = rawClient?.complianceRate ?? rawClient?.compliance_rate;
  const projectDelta = toNumber(rawClient?.projectDelta ?? rawClient?.project_delta ?? 0, 0);

  return {
    id,
    name,
    clientId,
    sector,
    activeProjects,
    projectDelta,
    complianceStatus: normalizeComplianceStatus(
      rawClient?.complianceStatus ?? rawClient?.compliance_status ?? rawClient?.status
    ),
    complianceRate: complianceRate == null ? null : toNumber(complianceRate, null),
    pendingRenewal: Boolean(rawClient?.pendingRenewal ?? rawClient?.pending_renewal)
  };
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

function getSectorPillClasses(sector) {
  const normalized = sector.toLowerCase();

  if (normalized.includes('pharma')) {
    return 'bg-blue-50 text-blue-700 border border-blue-100';
  }
  if (normalized.includes('environment')) {
    return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
  }
  if (normalized.includes('biotech')) {
    return 'bg-violet-50 text-violet-700 border border-violet-100';
  }
  if (normalized.includes('public')) {
    return 'bg-amber-50 text-amber-700 border border-amber-100';
  }

  return 'bg-gray-100 text-gray-700 border border-gray-200';
}

function getComplianceBadgeClasses(status) {
  if (status === 'COMPLIANT') {
    return 'text-emerald-700 bg-emerald-50 border border-emerald-100';
  }
  if (status === 'AUDIT PENDING') {
    return 'text-red-700 bg-red-50 border border-red-100';
  }
  return 'text-amber-700 bg-amber-50 border border-amber-100';
}

function getComplianceIcon(status) {
  if (status === 'COMPLIANT') return '●';
  if (status === 'AUDIT PENDING') return '▲';
  return '•';
}

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalClientsFromApi, setTotalClientsFromApi] = useState(0);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createClientForm, setCreateClientForm] = useState(INITIAL_CLIENT_FORM);
  const [createClientError, setCreateClientError] = useState('');
  const [creatingClient, setCreatingClient] = useState(false);

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
      setError(err.message || 'Failed to load clients.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        client.name.toLowerCase().includes(term) ||
        String(client.clientId).toLowerCase().includes(term) ||
        client.sector.toLowerCase().includes(term);

      const matchesSector =
        sectorFilter === 'all' || client.sector.toLowerCase() === sectorFilter;

      const matchesStatus =
        statusFilter === 'all' || client.complianceStatus === statusFilter;

      return matchesSearch && matchesSector && matchesStatus;
    });
  }, [clients, searchTerm, sectorFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sectorFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      setCurrentPage(safeCurrentPage);
    }
  }, [currentPage, safeCurrentPage]);

  const paginatedClients = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredClients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredClients, safeCurrentPage]);

  const pageButtons = useMemo(() => {
    const pages = [];
    const start = Math.max(1, safeCurrentPage - 2);
    const end = Math.min(totalPages, start + 4);

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [safeCurrentPage, totalPages]);

  const stats = useMemo(() => {
    const totalVisible = totalClientsFromApi || clients.length;
    const activeProjects = clients.reduce((sum, client) => sum + client.activeProjects, 0);
    const compliantCount = clients.filter((client) => client.complianceStatus === 'COMPLIANT').length;
    const pendingRenewals = clients.filter(
      (client) => client.pendingRenewal || client.complianceStatus === 'AUDIT PENDING'
    ).length;
    const complianceRate = totalVisible > 0 ? ((compliantCount / totalVisible) * 100).toFixed(1) : '0.0';
    const crossInstitutionalAverage = totalVisible > 0 ? (activeProjects / totalVisible).toFixed(1) : '0.0';

    return {
      totalVisible,
      activeProjects,
      complianceRate,
      pendingRenewals,
      crossInstitutionalAverage
    };
  }, [clients, totalClientsFromApi]);

  const handleCreateClientInputChange = (event) => {
    const { name, value } = event.target;
    setCreateClientForm((previousForm) => ({
      ...previousForm,
      [name]: value
    }));
  };

  const handleCreateClient = async (event) => {
    event.preventDefault();
    setCreateClientError('');
    setCreatingClient(true);

    try {
      const payload = {
        name: createClientForm.name.trim(),
        clientId: createClientForm.clientId.trim(),
        sector: createClientForm.sector,
        contactEmail: createClientForm.contactEmail.trim() || undefined
      };

      await apiService.clients.create(payload);

      setShowCreateModal(false);
      setCreateClientForm(INITIAL_CLIENT_FORM);
      await loadClients();
    } catch (err) {
      setCreateClientError(err.message || 'Could not register client.');
    } finally {
      setCreatingClient(false);
    }
  };

  const renderTableBody = () => {
    if (loading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <tr key={`loading-row-${index}`} className="border-b border-gray-100">
          <td colSpan="5" className="px-6 py-4">
            <div className="h-4 bg-gray-100 rounded animate-pulse" />
          </td>
        </tr>
      ));
    }

    if (!paginatedClients.length) {
      return (
        <tr>
          <td colSpan="5" className="px-6 py-14 text-center">
            <p className="text-gray-500 font-medium">No clients found for the selected filters.</p>
            <p className="text-sm text-gray-400 mt-1">Adjust filters or register a new client.</p>
          </td>
        </tr>
      );
    }

    return paginatedClients.map((client) => (
      <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-semibold">
              {client.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{client.name}</p>
              <p className="text-xs text-gray-500">ID: {client.clientId}</p>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-sm">
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getSectorPillClasses(client.sector)}`}>
            {client.sector}
          </span>
        </td>
        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
          <div className="flex items-center gap-2">
            <span>{client.activeProjects}</span>
            {client.projectDelta > 0 && (
              <span className="inline-flex items-center justify-center rounded-full w-5 h-5 text-[10px] bg-emerald-500 text-white">
                +{client.projectDelta}
              </span>
            )}
          </div>
        </td>
        <td className="px-6 py-4 text-sm">
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${getComplianceBadgeClasses(client.complianceStatus)}`}>
            <span>{getComplianceIcon(client.complianceStatus)}</span>
            {client.complianceStatus}
          </span>
        </td>
        <td className="px-6 py-4 text-sm text-right">
          <button
            type="button"
            className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            onClick={() => {
              // TODO: endpoint not found — replace with real call or remove if not needed
            }}
            title="Client actions"
          >
            ⋮
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Institutional Clients</h1>
                <p className="text-gray-600 mt-1">
                  Manage partner laboratories, pharmaceutical entities, and environmental agencies.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-3 rounded-lg transition"
              >
                <span>👥</span>
                Register New Client
              </button>
            </div>

            {error && (
              <div className="mt-6 p-4 rounded-lg border border-red-200 bg-red-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm text-red-700 font-medium">{error}</p>
                <button
                  type="button"
                  onClick={loadClients}
                  className="inline-flex items-center justify-center text-sm bg-white border border-red-200 text-red-700 px-3 py-1 rounded hover:bg-red-100"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
              <article className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm border-l-4 border-l-emerald-500">
                <p className="text-xs tracking-widest font-semibold text-gray-500 uppercase">Total Clients</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalVisible}</p>
                <p className="text-sm text-emerald-600 mt-2">↗ +12% vs last quarter</p>
              </article>

              <article className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <p className="text-xs tracking-widest font-semibold text-gray-500 uppercase">Active Projects</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{stats.activeProjects}</p>
                <p className="text-sm text-gray-500 mt-2">Cross-institutional average: {stats.crossInstitutionalAverage}</p>
              </article>

              <article className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <p className="text-xs tracking-widest font-semibold text-gray-500 uppercase">Compliance Rate</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{stats.complianceRate}%</p>
                <div className="w-full h-2 mt-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${Math.min(Number(stats.complianceRate), 100)}%` }}
                  />
                </div>
              </article>

              <article className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm border-l-4 border-l-red-500">
                <p className="text-xs tracking-widest font-semibold text-gray-500 uppercase">Pending Renewals</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{stats.pendingRenewals}</p>
                <p className="text-sm text-red-600 mt-2">! Requires immediate action</p>
              </article>
            </div>

            <section className="mt-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search clients or ID"
                      className="w-full sm:w-64 px-10 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔎</span>
                  </div>

                  <select
                    value={sectorFilter}
                    onChange={(event) => setSectorFilter(event.target.value)}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {SECTOR_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

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
                </div>

                <p className="text-sm text-gray-500">
                  Showing {filteredClients.length} of {stats.totalVisible} clients
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold tracking-widest text-gray-500 uppercase">Client Name &amp; ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold tracking-widest text-gray-500 uppercase">Industry Sector</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold tracking-widest text-gray-500 uppercase">Active Projects</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold tracking-widest text-gray-500 uppercase">Compliance Status</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold tracking-widest text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>{renderTableBody()}</tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((previousPage) => Math.max(previousPage - 1, 1))}
                    disabled={safeCurrentPage === 1}
                    className="inline-flex items-center justify-center p-0 w-8 h-8 border border-gray-300 rounded text-gray-600 leading-none hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ‹
                  </button>

                  {pageButtons.map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`inline-flex items-center justify-center p-0 w-8 h-8 rounded text-sm leading-none border transition ${
                        page === safeCurrentPage
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((previousPage) => Math.min(previousPage + 1, totalPages))}
                    disabled={safeCurrentPage === totalPages}
                    className="inline-flex items-center justify-center p-0 w-8 h-8 border border-gray-300 rounded text-gray-600 leading-none hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ›
                  </button>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Go to page:</span>
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
            </section>

            <div className="mt-6 border-t border-gray-200 pt-4 text-xs text-gray-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                SYSTEM ONLINE
              </p>
              <p>CLIA CERTIFIED V2.4</p>
              <p>© 2026 FLUXLAB PRECISION SYSTEMS</p>
            </div>
          </div>
        </main>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-xl bg-white rounded-xl border border-gray-200 shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Register New Client</h2>
                <p className="text-sm text-gray-500 mt-1">Create a new institutional client record.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="inline-flex items-center justify-center p-0 w-8 h-8 rounded-lg text-lg leading-none text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="px-6 py-5 space-y-4">
              {createClientError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {createClientError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input
                  type="text"
                  name="name"
                  value={createClientForm.name}
                  onChange={handleCreateClientInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Astra-Vanguard Pharmaceuticals"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                  <input
                    type="text"
                    name="clientId"
                    value={createClientForm.clientId}
                    onChange={handleCreateClientInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="AV-7729-24"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                  <select
                    name="sector"
                    value={createClientForm.sector}
                    onChange={handleCreateClientInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {SECTOR_OPTIONS.filter((option) => option.value !== 'all').map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email (optional)</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={createClientForm.contactEmail}
                  onChange={handleCreateClientInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="contact@institution.org"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                {/* TODO: endpoint not found — replace with real call or remove if not needed */}
                Additional fields (renewal date, compliance document IDs, account owner) can be added when backend contract is confirmed.
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingClient}
                  className="inline-flex items-center justify-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-semibold rounded-lg"
                >
                  {creatingClient ? 'Saving...' : 'Register Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
