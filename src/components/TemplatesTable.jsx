/**
 * Templates Table Component
 * 
 * Displays a list of data templates with actions to create, edit, and delete
 * Integrates with Supabase authentication and JWT tokens
 */

import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TemplatesTable() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.templates.getAll();
      setTemplates(data);
    } catch (err) {
      console.error('Error loading templates:', err);
      setError(err.message || 'Error al cargar los templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setIsEditing(false);
    setFormData({ name: '', description: '' });
    setSelectedTemplate(null);
    setShowModal(true);
  };

  const handleEdit = (template) => {
    setIsEditing(true);
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setTemplateToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;
    
    try {
      await apiService.templates.remove(templateToDelete);
      setTemplates(templates.filter(t => t.id !== templateToDelete));
      setShowDeleteModal(false);
      setTemplateToDelete(null);
    } catch (err) {
      console.error('Error deleting template:', err);
      setError('Error al eliminar el template');
      setShowDeleteModal(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name || formData.name.trim() === '') {
      setError('El nombre del template es requerido');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      if (isEditing && selectedTemplate) {
        const updatedTemplate = await apiService.templates.update(selectedTemplate.id, formData);
        setTemplates(templates.map(t => 
          t.id === selectedTemplate.id ? updatedTemplate : t
        ));
      } else {
        const newTemplate = await apiService.templates.create(formData);
        setTemplates([...templates, newTemplate]);
      }
      setShowModal(false);
      setFormData({ name: '', description: '' });
      setSelectedTemplate(null);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving template:', err);
      setError(err.message || 'Error al guardar el template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Cargando templates...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Header with Create Button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Templates</h2>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
        >
          <span>+</span>
          <span>Crear Template</span>
        </button>
      </div>

      {/* Templates Summary */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{templates.length}</span> Templates creados
        </div>
      </div>

      {/* Templates Table */}
      {templates.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No hay templates creados aún</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">NOMBRE</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">DESCRIPCIÓN</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">CREADO</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600 font-semibold">
                          📋
                        </div>
                        <span className="font-medium text-gray-900">{template.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {template.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(template.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(template)}
                          className="p-2 hover:bg-gray-100 rounded lg text-gray-600 hover:text-blue-600 transition"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-red-600 transition"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal - Design like Edit Sample Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="bg-green-500 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">📋</div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {isEditing ? `Editar Template: ${selectedTemplate?.name}` : 'Crear Template'}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setFormData({ name: '', description: '' });
                  setSelectedTemplate(null);
                  setIsEditing(false);
                  setError(null);
                }}
                className="text-white hover:bg-green-600 p-1 rounded transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={150}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    placeholder="Ej: Water Analysis Template"
                  />
                </div>

                {/* Description Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                    Descripción
                  </label>
                  <textarea
                    maxLength={255}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    placeholder="Descripción del template"
                    rows={4}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({ name: '', description: '' });
                      setSelectedTemplate(null);
                      setIsEditing(false);
                      setError(null);
                    }}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:bg-gray-100 disabled:cursor-not-allowed font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                  >
                    {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Alert Style */}
      {showDeleteModal && templateToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2m0-4a9 9 0 11-18 0 9 9 0 0118 0zm-2 3a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Eliminar Template
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    ¿Estás seguro de que quieres eliminar el template <span className="font-semibold">{templates.find(t => t.id === templateToDelete)?.name}</span>? Esta acción no puede ser deshacha.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setTemplateToDelete(null);
                }}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition disabled:bg-gray-100 disabled:cursor-not-allowed font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
