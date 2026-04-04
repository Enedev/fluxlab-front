/**
 * Samples Table Component
 * 
 * Displays a list of lab samples with their associated templates and status
 * Integrates with Supabase authentication and JWT tokens
 */

import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SamplesTable() {
  const { user } = useAuth();
  const [samples, setSamples] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSample, setSelectedSample] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sampleToDelete, setSampleToDelete] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    code: '',
    status: 'pending',
    templateId: '',
    projectId: '',
    fieldValues: {} // Para almacenar los valores dinámicos
  });
  const [selectedTemplateObj, setSelectedTemplateObj] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar template seleccionado para mostrar sus campos
  useEffect(() => {
    if (formData.templateId) {
      const template = templates.find(t => t.id === formData.templateId);
      setSelectedTemplateObj(template || null);
      
      // Inicializar fieldValues si no existen
      if (template?.fields && !isEditing) {
        const initialValues = {};
        template.fields.forEach(field => {
          initialValues[field.id] = field.dataType === 'boolean' ? false : '';
        });
        setFormData(prev => ({ ...prev, fieldValues: initialValues }));
      }
    } else {
      setSelectedTemplateObj(null);
    }
  }, [formData.templateId, templates, isEditing]);

  // Load samples and templates on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [samplesData, templatesData, projectsResponse] = await Promise.all([
        apiService.samples.getAll().catch(err => {
          console.error('Error fetching samples:', err);
          return [];
        }),
        apiService.templates.getAll().catch(err => {
          console.error('Error fetching templates:', err);
          return [];
        }),
        apiService.projects.getAll().catch(err => {
          console.error('Error fetching projects:', err);
          return [];
        })
      ]);

      setSamples(Array.isArray(samplesData) ? samplesData : []);
      setTemplates(Array.isArray(templatesData) ? templatesData : []);
      
      // El backend de projects devuelve un objeto { data: [...] } o { message: ..., data: [...] }
      const projectsList = projectsResponse?.data && Array.isArray(projectsResponse.data) 
        ? projectsResponse.data 
        : (Array.isArray(projectsResponse) ? projectsResponse : []);
        
      setProjects(projectsList);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setIsEditing(false);
    setFormData({ code: '', status: 'pending', templateId: '', projectId: '', fieldValues: {} });
    setSelectedSample(null);
    setShowModal(true);
  };

  const handleEdit = (sample) => {
    setIsEditing(true);
    setSelectedSample(sample);
    
    // Mapear valores existentes del backend si hay
    // El backend los devuelve como sampleFieldValue en findOne o sample.sampleFieldValues en las relaciones
    const initialFieldValues = {};
    const valuesSource = sample.sampleFieldValues || sample.values || [];
    
    valuesSource.forEach(v => {
      // Intentar obtener el ID del campo (puede estar en field.id o fieldId)
      const fieldId = v.field?.id || v.fieldId;
      if (fieldId) {
        // Obtener el valor de la propiedad correcta
        let val = '';
        if (v.valueText !== null && v.valueText !== undefined) val = v.valueText;
        else if (v.valueNumber !== null && v.valueNumber !== undefined) val = v.valueNumber;
        else if (v.valueDate !== null && v.valueDate !== undefined) val = v.valueDate;
        else if (v.valueBoolean !== null && v.valueBoolean !== undefined) val = v.valueBoolean;
        
        initialFieldValues[fieldId] = val;
      }
    });

    setFormData({
      code: sample.code,
      status: sample.status,
      templateId: sample.template?.id || '',
      projectId: sample.project?.id || '',
      fieldValues: initialFieldValues
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setSampleToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!sampleToDelete) return;
    
    try {
      setIsSubmitting(true);
      await apiService.samples.remove(sampleToDelete);
      setSamples(samples.filter(s => s.id !== sampleToDelete));
      setShowDeleteModal(false);
      setSampleToDelete(null);
    } catch (err) {
      console.error('Error deleting sample:', err);
      setError('Error al eliminar la muestra');
      setShowDeleteModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.code || formData.code.trim() === '') {
      setError('El código de muestra es requerido');
      return;
    }
    if (!formData.templateId) {
      setError('Debes seleccionar un template');
      return;
    }
    if (!formData.projectId) {
      setError('Debes seleccionar un proyecto');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      // Preparar datos para el backend
      const samplePayload = {
        code: formData.code,
        status: formData.status,
        templateId: formData.templateId,
        projectId: formData.projectId,
        values: Object.entries(formData.fieldValues).map(([fieldId, value]) => {
          const field = selectedTemplateObj?.fields?.find(f => f.id === fieldId);
          return {
            fieldId,
            valueText: field?.dataType === 'text' ? String(value) : null,
            valueNumber: field?.dataType === 'number' ? Number(value) : null,
            valueDate: field?.dataType === 'date' ? value : null,
            valueBoolean: field?.dataType === 'boolean' ? Boolean(value) : null
          };
        })
      };

      if (isEditing && selectedSample) {
        const updatedSample = await apiService.samples.updateWithValues(selectedSample.id, samplePayload);
        setSamples(samples.map(s => 
          s.id === selectedSample.id ? updatedSample : s
        ));
      } else {
        const newSample = await apiService.samples.createWithValues(samplePayload);
        setSamples([...samples, newSample]);
      }
      setShowModal(false);
      setFormData({ code: '', status: 'pending', templateId: '', projectId: '', fieldValues: {} });
      setSelectedSample(null);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving sample:', err);
      setError(err.message || 'Error al guardar la muestra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  const filteredSamples = (samples || []).filter(s => 
    filterStatus === 'all' || s.status === filterStatus
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Cargando muestras...</div>
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
        <h2 className="text-lg font-semibold text-gray-900">Muestras</h2>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
        >
          <span>+</span>
          <span>Crear Muestra</span>
        </button>
      </div>

      {/* Summary and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex-1">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{samples.length}</span> muestras en total
          </div>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-48">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="completed">Completado</option>
            <option value="rejected">Rechazado</option>
          </select>
        </div>
      </div>

      {/* Samples Table */}
      {filteredSamples.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No hay muestras {filterStatus !== 'all' ? `con estado "${filterStatus}"` : ''}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">CÓDIGO</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">TEMPLATE</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">PROYECTO</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ESTADO</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">CREADO</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSamples.map((sample) => (
                  <tr key={sample.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-100 rounded flex items-center justify-center text-teal-600 font-semibold">
                          🧪
                        </div>
                        <code className="font-mono text-sm font-medium text-gray-900">{sample.code}</code>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {sample?.template?.name || 'Sin template'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {sample?.project?.name || 'Sin proyecto'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(sample?.status)}`}>
                        {sample?.status === 'pending' && 'Pendiente'}
                        {sample?.status === 'completed' && 'Completado'}
                        {sample?.status === 'rejected' && 'Rechazado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(sample?.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(sample)}
                          className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600 transition"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(sample?.id)}
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

      {/* Create/Edit Modal - Professional Design */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="bg-blue-500 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🧪</div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {isEditing ? `Editar Muestra: ${selectedSample?.code}` : 'Crear Muestra'}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setFormData({ code: '', status: 'pending', templateId: '', projectId: '' });
                  setSelectedSample(null);
                  setIsEditing(false);
                  setError(null);
                }}
                className="text-white hover:bg-blue-600 p-1 rounded transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Sample Code Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                    Código de Muestra *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 font-mono"
                    placeholder="Ej: BIO-MS-001"
                  />
                </div>

                {/* Project Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                    Proyecto *
                  </label>
                  <select
                    required
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Selecciona un proyecto</option>
                    {(projects || []).map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                    Template *
                  </label>
                  <select
                    required
                    value={formData.templateId}
                    onChange={(e) => setFormData({ ...formData, templateId: e.target.value, fieldValues: {} })}
                    disabled={isSubmitting || isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Selecciona un template</option>
                    {(templates || []).map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Fields from Template */}
                {selectedTemplateObj && selectedTemplateObj.fields && selectedTemplateObj.fields.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                    <h4 className="text-xs font-black text-blue-900/40 uppercase tracking-widest border-b border-gray-200 pb-2">
                      Campos de la Plantilla
                    </h4>
                    {selectedTemplateObj.fields.map(field => (
                      <div key={field.id}>
                        <label className="block text-xs font-bold text-gray-600 mb-1">
                          {field.name} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.dataType === 'boolean' ? (
                          <input
                            type="checkbox"
                            checked={formData.fieldValues[field.id] || false}
                            onChange={(e) => setFormData({
                              ...formData,
                              fieldValues: { ...formData.fieldValues, [field.id]: e.target.checked }
                            })}
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        ) : field.dataType === 'date' ? (
                          <input
                            type="date"
                            required={field.required}
                            value={formData.fieldValues[field.id] || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              fieldValues: { ...formData.fieldValues, [field.id]: e.target.value }
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        ) : (
                          <input
                            type={field.dataType === 'number' ? 'number' : 'text'}
                            required={field.required}
                            value={formData.fieldValues[field.id] || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              fieldValues: { ...formData.fieldValues, [field.id]: e.target.value }
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder={`Ingrese ${field.name.toLowerCase()}...`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Status Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="completed">Completado</option>
                    <option value="rejected">Rechazado</option>
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({ code: '', status: 'pending', templateId: '', projectId: '' });
                      setSelectedSample(null);
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
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
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
      {showDeleteModal && sampleToDelete && (
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
                    Eliminar Muestra
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    ¿Estás seguro de que quieres eliminar la muestra <span className="font-semibold">{samples?.find(s => s.id === sampleToDelete)?.code || 'seleccionada'}</span>? Esta acción no puede ser deshacha.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSampleToDelete(null);
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
