/**
 * Samples Table Component
 * 
 * Displays a list of lab samples with their associated templates and status
 * Integrates with Inline Editing and Quick Add
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
  
  // Inline Editing State
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    status: '',
    fieldValues: {}
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sampleToDelete, setSampleToDelete] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Quick Add State
  const [quickAddRow, setQuickAddRow] = useState({
    templateId: null,
    projectId: null,
    code: '',
    status: 'pending',
    fieldValues: {}
  });

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
    const initialFieldValues = {};
    if (sample.values) {
      sample.values.forEach(v => {
        initialFieldValues[v.fieldId] = v.valueText || v.valueNumber || v.valueDate || v.valueBoolean || '';
      });
    }

    setEditFormData({
      status: sample.status,
      fieldValues: initialFieldValues
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditFormData({ status: '', fieldValues: {} });
  };

  const saveInlineEdit = async (sample) => {
    setIsSubmitting(true);
    try {
      const template = templates.find(t => t.id === sample.template?.id);
      const payload = {
        status: editFormData.status,
        values: Object.entries(editFormData.fieldValues).map(([fieldId, value]) => {
          const field = template?.fields?.find(f => f.id === fieldId);
          return {
            fieldId,
            valueText: field?.dataType === 'text' ? String(value) : null,
            valueNumber: field?.dataType === 'number' ? Number(value) : null,
            valueDate: field?.dataType === 'date' ? value : null,
            valueBoolean: field?.dataType === 'boolean' ? Boolean(value) : null
          };
        })
      };

      await apiService.samples.updateWithValues(sample.id, payload);
      await loadData();
      cancelEditing();
    } catch (err) {
      setError(err.message || 'Error al actualizar la muestra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdd = async (templateId, projectId) => {
    if (!quickAddRow.code || quickAddRow.code.trim() === '') {
      setError('El c�digo es requerido para la creaci�n r�pida');
      return;
    }

    setIsSubmitting(true);
    try {
      const template = templates.find(t => t.id === templateId);
      const payload = {
        code: quickAddRow.code,
        status: quickAddRow.status,
        templateId,
        projectId,
        values: Object.entries(quickAddRow.fieldValues).map(([fieldId, value]) => {
          const field = template?.fields?.find(f => f.id === fieldId);
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
      console.error('Error deleting sample:', err);
      setError('Error al eliminar la muestra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
    } catch (e) { return 'Fecha inv�lida'; }
  };

  const filteredSamples = (samples || []).filter(s => 
    filterStatus === 'all' || s.status === filterStatus
  );

  const groupedDataByProject = projects.map(project => {
    const projectSamples = filteredSamples.filter(s => 
      s.project?.id === project.id || (s.project && s.project.id === project.id)
    );

    const projectTemplates = templates.map(template => {
      const templateSamples = projectSamples.filter(s => 
        s.template?.id === template.id || (s.template && s.template.id === template.id)
      );
      return { ...template, samples: templateSamples };
    }).filter(t => t.samples.length > 0);

    return { ...project, templates: projectTemplates, totalSamples: projectSamples.length };
  }).filter(p => p.totalSamples > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Cargando muestras...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 border-l-4 border-teal-500 pl-3">Sustancias y Muestras</h2>
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

      {groupedDataByProject.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center mt-6">
          <p className="text-gray-500 font-medium">No hay muestras para mostrar.</p>
        </div>
      ) : (
        <div className="space-y-8 mt-6">
          {groupedDataByProject.map((project) => (
            <div key={project.id} className="space-y-4">
              {/* Project Bar */}
              <div className="bg-slate-900 text-white px-6 py-3 rounded-lg flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="bg-teal-500 p-1.5 rounded-md text-white">?</div>
                  <h2 className="text-lg font-bold">Project: {project.name}</h2>
                </div>
                <div className="bg-emerald-950/40 text-emerald-400 px-3 py-1 rounded border border-emerald-500/20 text-[10px] font-mono uppercase tracking-widest">
                  ID: {project.id.slice(0, 8)}
                </div>
              </div>

              {/* +NEW TEMPLATE Dropdown */}
              <div className="pl-4 relative">
                <button 
                  className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-bold text-xs bg-teal-50 px-3 py-1.5 rounded-md border border-teal-100 transition"
                  onClick={() => setActiveDropdown(activeDropdown === project.id ? null : project.id)}
                >
                  <span className="text-base leading-none">+</span>
                  <span>NEW TEMPLATE</span>
                </button>

                {activeDropdown === project.id && (
                  <div className="absolute left-4 top-10 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-2 max-h-60 overflow-y-auto">
                    {templates.map(t => (
                      <button
                        key={t.id}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 transition flex items-center justify-between"
                        onClick={() => {
                          setQuickAddRow({
                            ...quickAddRow,
                            templateId: t.id,
                            projectId: project.id,
                            code: "NEW-" + Math.floor(Math.random()*1000),
                            fieldValues: {}
                          });
                          setActiveDropdown(null);
                        }}
                      >
                        <span className="font-medium">{t.name}</span>
                        <span className="text-[9px] bg-gray-100 text-gray-400 px-1 rounded font-black">ADD</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Templates under Project */}
              <div className="space-y-6">
                {project.templates.map(template => (
                  <div key={`${project.id}-${template.id}`} className="ml-4 bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    {/* Template Header */}
                    <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">??</span>
                        <h3 className="text-slate-700 font-bold">Template: {template.name}</h3>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {template.samples.length} SAMPLES
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-white border-b border-gray-200">
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">SAMPLE CODE</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">STATUS</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">CREATED AT</th>
                            {template.fields?.map(field => (
                              <th key={field.id} className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                                {field.name}
                              </th>
                            ))}
                            <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {template.samples.map(sample => {
                            const isEditingCurrent = editingId === sample.id;
                            
                            return (
                              <tr key={sample.id} className={`${isEditingCurrent ? "bg-teal-50/30" : "hover:bg-slate-50/50"} transition`}>
                                <td className="px-6 py-4 font-mono text-xs font-bold text-teal-600">
                                  {sample.code}
                                </td>
                                <td className="px-6 py-4">
                                  {isEditingCurrent ? (
                                    <select 
                                      className="text-xs border border-teal-200 rounded px-2 py-1 bg-white focus:ring-1 focus:ring-teal-500 outline-none font-bold uppercase"
                                      value={editFormData.status}
                                      onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                                    >
                                      <option value="pending">PENDING</option>
                                      <option value="completed">COMPLETED</option>
                                      <option value="rejected">REJECTED</option>
                                    </select>
                                  ) : (
                                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md border ${getStatusBadgeColor(sample.status)}`}>
                                      {sample.status}
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-xs font-bold text-slate-400">
                                  {formatDate(sample.createdAt)}
                                </td>
                                
                                {/* Dynamic Field Values */}
                                {template.fields?.map(field => {
                                  const valObj = (sample.sampleFieldValues || sample.values || []).find(v => (v.field?.id === field.id || v.fieldId === field.id));
                                  
                                  if (isEditingCurrent) {
                                    return (
                                      <td key={field.id} className="px-6 py-4">
                                        <input
                                          type={field.dataType === "number" ? "number" : "text"}
                                          className="w-full text-xs font-bold text-slate-900 border border-teal-200 rounded px-2 py-1 bg-white"
                                          value={editFormData.fieldValues[field.id] || ""}
                                          onChange={(e) => setEditFormData({
                                            ...editFormData,
                                            fieldValues: { ...editFormData.fieldValues, [field.id]: e.target.value }
                                          })}
                                        />
                                      </td>
                                    );
                                  }

                                  let displayVal = "-";
                                  if (valObj) {
                                    if (valObj.valueText !== null && valObj.valueText !== undefined && valObj.valueText !== "") displayVal = valObj.valueText;
                                    else if (valObj.valueNumber !== null && valObj.valueNumber !== undefined) displayVal = valObj.valueNumber;
                                    else if (valObj.valueDate !== null && valObj.valueDate !== undefined) displayVal = valObj.valueDate;
                                    else if (valObj.valueBoolean !== null && valObj.valueBoolean !== undefined) displayVal = valObj.valueBoolean ? "YES" : "NO";
                                  }
                                  return (<td key={field.id} className="px-6 py-4 text-xs font-black text-slate-900">{displayVal}</td>);
                                })}

                                <td className="px-6 py-4 text-right">
                                  {isEditingCurrent ? (
                                    <div className="flex items-center justify-end gap-3">
                                      <button 
                                        onClick={() => saveInlineEdit(sample)}
                                        className="text-green-600 hover:scale-125 transition text-lg"
                                        title="Guardar"
                                      >
                                        ??
                                      </button>
                                      <button 
                                        onClick={cancelEditing}
                                        className="text-red-600 hover:scale-125 transition text-lg"
                                        title="Cancelar"
                                      >
                                        ?
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-end gap-3 opacity-30 hover:opacity-100 transition">
                                      <button onClick={() => startEditing(sample)} className="hover:scale-120 hover:grayscale-0 transition grayscale" title="Editar">??</button>
                                      <button onClick={() => handleDelete(sample.id)} className="hover:scale-120 hover:grayscale-0 transition grayscale" title="Eliminar">???</button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}

                          {/* QUICK ADD ROW */}
                          <tr className="bg-slate-50/20 group">
                            <td className="px-6 py-3">
                              <input
                                type="text"
                                placeholder="ADD NEW RECORD"
                                className="bg-transparent border-none focus:ring-0 text-xs font-bold text-slate-900 placeholder-slate-300 w-full"
                                value={quickAddRow.templateId === template.id && quickAddRow.projectId === project.id ? quickAddRow.code : ""}
                                onChange={(e) => setQuickAddRow({ ...quickAddRow, templateId: template.id, projectId: project.id, code: e.target.value })}
                                onKeyDown={(e) => { if (e.key === "Enter") handleQuickAdd(template.id, project.id); }}
                              />
                            </td>
                            <td className="px-6 py-3">
                              <select 
                                className="bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase text-slate-400 w-full cursor-pointer"
                                value={quickAddRow.templateId === template.id && quickAddRow.projectId === project.id ? quickAddRow.status : "pending"}
                                onChange={(e) => setQuickAddRow({ ...quickAddRow, templateId: template.id, projectId: project.id, status: e.target.value })}
                              >
                                <option value="pending">PENDING</option>
                                <option value="completed">COMPLETED</option>
                                <option value="rejected">REJECTED</option>
                              </select>
                            </td>
                            <td className="px-6 py-3 text-[10px] font-bold text-slate-300">AUTO-GEN</td>
                            {template.fields?.map(field => (
                              <td key={field.id} className="px-6 py-3">
                                <input
                                  type={field.dataType === "number" ? "number" : "text"}
                                  placeholder="..."
                                  className="bg-transparent border-none focus:ring-0 text-xs font-black text-slate-400 placeholder-slate-200 w-full"
                                  value={quickAddRow.templateId === template.id && quickAddRow.projectId === project.id ? (quickAddRow.fieldValues[field.id] || "") : ""}
                                  onChange={(e) => setQuickAddRow({ ...quickAddRow, templateId: template.id, projectId: project.id, fieldValues: { ...quickAddRow.fieldValues, [field.id]: e.target.value } })}
                                  onKeyDown={(e) => { if (e.key === "Enter") handleQuickAdd(template.id, project.id); }}
                                />
                              </td>
                            ))}
                            <td className="px-6 py-3 text-right">
                              <button onClick={() => handleQuickAdd(template.id, project.id)} className="text-slate-300 hover:text-teal-500 font-bold text-lg">{isSubmitting ? "..." : "+"}</button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

                {/* Initializing Template (from Dropdown) */}
                {templates.filter(t => quickAddRow.templateId === t.id && quickAddRow.projectId === project.id && !project.templates.some(pt => pt.id === t.id)).map(template => (
                  <div key={`${project.id}-${template.id}-new`} className="ml-4 bg-white border border-teal-200 rounded-xl overflow-hidden shadow-sm border-dashed">
                      <div className="bg-teal-50/20 px-6 py-3 border-b border-teal-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-teal-400">??</span>
                          <h3 className="text-teal-700 font-bold">New Table: {template.name}</h3>
                        </div>
                        <span className="text-[9px] font-black text-teal-400 italic">INITIALIZING...</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <tbody>
                            <tr>
                              <td className="px-6 py-3">
                                <input type="text" autoFocus placeholder="CODE-001" className="bg-transparent border-none focus:ring-0 text-xs font-bold text-teal-900 w-full" value={quickAddRow.code} onChange={(e) => setQuickAddRow({ ...quickAddRow, code: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") handleQuickAdd(template.id, project.id); }} />
                              </td>
                              {template.fields?.map(field => (
                                <td key={field.id} className="px-6 py-3">
                                  <input type={field.dataType === "number" ? "number" : "text"} className="bg-transparent border-none focus:ring-0 text-xs font-black text-teal-900 w-full" value={quickAddRow.fieldValues[field.id] || ""} onChange={(e) => setQuickAddRow({ ...quickAddRow, fieldValues: { ...quickAddRow.fieldValues, [field.id]: e.target.value } })} onKeyDown={(e) => { if (e.key === "Enter") handleQuickAdd(template.id, project.id); }} />
                                </td>
                              ))}
                              <td className="px-6 py-3 text-right">
                                <button onClick={() => handleQuickAdd(template.id, project.id)} className="text-teal-600 font-bold text-lg">+</button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 overflow-hidden">
            <div className="mb-4 text-center">
              <div className="bg-red-50 text-red-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">???</div>
              <h3 className="text-lg font-bold text-gray-900">�Eliminar Muestra?</h3>
              <p className="text-gray-500 text-sm">Esta acci�n es irreversible y eliminar� todos los datos asociados.</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition">No, volver</button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition">S�, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
