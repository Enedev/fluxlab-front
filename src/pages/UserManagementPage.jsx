/**
 * User Management Page
 * 
 * Manage users and roles (Admin only)
 * Features: Create users, view users list, delete users
 */

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { createUser, getAllUsers, deleteUser } from '../services/userService';

const ROLES = [
  { id: 'technician', label: 'Técnico de laboratorio' },
  { id: 'researcher', label: 'Investigador' },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newUserPassword, setNewUserPassword] = useState(null);
  const [newUserEmail, setNewUserEmail] = useState(null);
  const [filterRole, setFilterRole] = useState('all'); // 'all', 'technician', 'researcher'

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'technician',
  });

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Load users from backend
  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(`Error al cargar usuarios: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Handle form input change
  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }

  // Handle form submit
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await createUser(formData);
      
      // Show password modal
      setNewUserPassword(result.temporaryPassword);
      setNewUserEmail(formData.email);
      setShowPasswordModal(true);

      // Reset form
      setFormData({
        name: '',
        email: '',
        role: 'technician',
      });

      // Reload users
      await loadUsers();
    } catch (err) {
      setError(`Error al crear usuario: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Handle delete user
  async function handleDeleteUser(userId) {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteUser(userId);
      await loadUsers();
    } catch (err) {
      setError(`Error al eliminar usuario: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Copy to clipboard
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
  }

  // Filter users by role
  function getFilteredUsers() {
    if (filterRole === 'all') {
      return users;
    }
    return users.filter(user => user.role === filterRole);
  }

  // Format date for last sign in
  function formatLastSignIn(lastSignInAt) {
    if (!lastSignInAt) return 'Nunca';
    
    try {
      const date = new Date(lastSignInAt);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Ahora';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      
      return date.toLocaleDateString('es-ES');
    } catch (err) {
      return 'Nunca';
    }
  }

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
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
              <p className="text-gray-600 mt-1">Administra el personal del laboratorio</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              {/* Left Column - Form */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 sticky top-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Agregar Nuevo Usuario</h2>
                  <p className="text-sm text-gray-600 mb-6">Registra nuevo personal de laboratorio.</p>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Ej: Dr. Julian Pierce"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-400"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="j.pierce@emeraldlab.io"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-400"
                      />
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rol
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {ROLES.map(role => (
                          <option key={role.id} value={role.id}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <span>🔒</span>
                      {loading ? 'Creando...' : 'Completar Registro'}
                    </button>
                  </form>

                  {/* Compliance Notice */}
                  <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-green-900 mb-2">AVISO DE CUMPLIMIENTO</h3>
                    <p className="text-xs text-green-800">
                      Todos los usuarios nuevos deben completar la orientación ISO 17025 antes de obtener acceso al laboratorio.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Users Table */}
              <div className="lg:col-span-2">
                {/* Staff Stats */}
                <div className="grid grid-cols-1 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-emerald-600 font-bold text-2xl">{users.length}</div>
                    <div className="text-gray-600 text-sm">PERSONAL ACTIVO</div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="mb-4 flex gap-4 border-b border-gray-200">
                  <button
                    onClick={() => setFilterRole('all')}
                    className={`px-4 py-2 border-b-2 font-medium text-sm transition ${
                      filterRole === 'all'
                        ? 'text-emerald-600 border-emerald-600'
                        : 'text-gray-600 hover:text-gray-800 border-transparent'
                    }`}
                  >
                    Todo el Personal
                  </button>
                  <button
                    onClick={() => setFilterRole('technician')}
                    className={`px-4 py-2 border-b-2 font-medium text-sm transition ${
                      filterRole === 'technician'
                        ? 'text-emerald-600 border-emerald-600'
                        : 'text-gray-600 hover:text-gray-800 border-transparent'
                    }`}
                  >
                    Técnicos
                  </button>
                  <button
                    onClick={() => setFilterRole('researcher')}
                    className={`px-4 py-2 border-b-2 font-medium text-sm transition ${
                      filterRole === 'researcher'
                        ? 'text-emerald-600 border-emerald-600'
                        : 'text-gray-600 hover:text-gray-800 border-transparent'
                    }`}
                  >
                    Investigadores
                  </button>
                </div>

                {/* Users List Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">MIEMBRO DEL PERSONAL</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ROL</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ÚLTIMO INGRESO</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ESTADO</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ACCIONES</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFilteredUsers().length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                              {loading ? 'Cargando usuarios...' : 'No hay usuarios registrados'}
                            </td>
                          </tr>
                        ) : (
                          getFilteredUsers().map(user => (
                            <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm">
                                <div className="font-medium text-gray-900">{user.name}</div>
                                <div className="text-gray-600 text-xs">{user.email}</div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {ROLES.find(r => r.id === user.role)?.label || user.role}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {formatLastSignIn(user.last_sign_in_at)}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  user.active
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {user.active ? '● ACTIVO' : '● INACTIVO'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  disabled={loading}
                                  className="text-red-600 hover:text-red-800 font-medium disabled:text-gray-400"
                                >
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {getFilteredUsers().length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        MOSTRANDO {getFilteredUsers().length} DE {users.length} USUARIOS
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">1</button>
                        <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">2</button>
                        <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">3</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Usuario Creado Exitosamente!</h2>
            
            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>El usuario ha sido creado</strong>. Comparte las siguientes credenciales temporales:
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={newUserEmail}
                    className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                  />
                  <button
                    onClick={() => copyToClipboard(newUserEmail)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              {/* Temporary Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Temporal</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={newUserPassword}
                    className="flex-1 px-4 py-2 bg-yellow-50 border border-yellow-300 rounded-lg text-gray-700 font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(newUserPassword)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>⚠️ Importante:</strong> El usuario deberá cambiar esta contraseña temporal después de iniciar sesión por primera vez.
                </p>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowPasswordModal(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
