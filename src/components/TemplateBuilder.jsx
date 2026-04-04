/**
 * Template Builder Component
 * 
 * Allows creating and editing laboratory templates with dynamic fields.
 * Follows the design provided in the reference image.
 */

import { useState } from 'react';
import { apiService } from '../services/api';

export default function TemplateBuilder({ onSave, onCancel, template = null }) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    fields: template?.fields?.map(f => ({
      ...f,
      id: f.id || Date.now() + Math.random() // Ensure local ID for keys
    })) || [
      { id: Date.now(), name: '', dataType: 'text', required: true }
    ]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleAddField = () => {
    setFormData({
      ...formData,
      fields: [
        ...formData.fields,
        { id: Date.now(), name: '', dataType: 'text', required: true }
      ]
    });
  };

  const handleRemoveField = (id) => {
    if (formData.fields.length === 1) return;
    setFormData({
      ...formData,
      fields: formData.fields.filter(f => f.id !== id)
    });
  };

  const updateField = (id, updates) => {
    setFormData({
      ...formData,
      fields: formData.fields.map(f => f.id === id ? { ...f, ...updates } : f)
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('El nombre del template es requerido');
      return;
    }

    if (formData.fields.some(f => !f.name.trim())) {
      setError('Todos los campos deben tener un nombre');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Build the data structure for backend (expected format with fields)
      const templateData = {
        name: formData.name,
        description: formData.description,
        fields: formData.fields.map((f, index) => ({
          name: f.name,
          dataType: f.dataType, // text, number, date, boolean
          required: Boolean(f.required),
          orderIndex: index
        }))
      };

      let result;
      if (template?.id) {
        // Update existing template (NOW SUPPORTS FIELDS)
        result = await apiService.templates.update(template.id, templateData);
      } else {
        // Create new template
        result = await apiService.templates.createWithFields(templateData);
      }
      
      onSave(result);
    } catch (err) {
      console.error('Error saving template:', err);
      setError(err.message || 'Error al guardar el template');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {template ? 'Modificar Plantilla' : 'Nueva Plantilla'}
          </h2>
          <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded uppercase tracking-widest">
            {template ? 'Edit Mode' : 'Draft Mode'}
          </span>
        </div>
      </div>

      {/* Template Details Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
        <div className="flex items-center gap-3 text-green-600 font-bold border-b border-gray-50 pb-4">
          <span className="text-xl">📋</span>
          <span className="uppercase tracking-wide text-sm">Template Details</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-blue-900 uppercase tracking-[0.1em] mb-2 opacity-60">
              Template Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Molecular Stability Test"
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-green-500 transition-all font-medium text-gray-700"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-blue-900 uppercase tracking-[0.1em] mb-2 opacity-60">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Define the scope and mandatory procedures for this template..."
              rows="3"
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-green-500 transition-all font-medium text-gray-700 resize-none"
            ></textarea>
          </div>
        </div>
      </div>

      {/* Fields Builder Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Fields Builder</h3>
            <p className="text-xs text-gray-500 font-medium">Define the data structure for this laboratory protocol.</p>
          </div>
          <button
            onClick={handleAddField}
            className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
          >
            <span>+</span>
            <span>Add Field</span>
          </button>
        </div>

        {/* Column Headers */}
        <div className="grid grid-cols-[40px_1fr_200px_100px_40px] gap-4 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <div></div>
          <div>Field Name</div>
          <div>Data Type</div>
          <div className="text-center">Required</div>
          <div></div>
        </div>

        {/* Fields List */}
        <div className="space-y-3">
          {formData.fields.map((field, index) => (
            <div 
              key={field.id}
              className="grid grid-cols-[40px_1fr_200px_100px_40px] gap-4 items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex justify-center text-gray-300">
                <span className="cursor-grab">⠿</span>
              </div>

              <input
                type="text"
                value={field.name}
                onChange={(e) => updateField(field.id, { name: e.target.value })}
                placeholder="Enter field name..."
                className="w-full bg-transparent border-none focus:ring-0 font-bold text-gray-700 placeholder:text-gray-300"
              />

              <select
                value={field.dataType}
                onChange={(e) => updateField(field.id, { dataType: e.target.value })}
                className="bg-gray-50 border-none rounded-lg py-2 px-3 text-sm font-bold text-gray-700 focus:ring-1 focus:ring-green-500"
              >
                <option value="text">String</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="boolean">Boolean</option>
              </select>

              <div className="flex justify-center">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateField(field.id, { required: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-200 text-green-500 focus:ring-green-500"
                />
              </div>

              <button
                onClick={() => handleRemoveField(field.id)}
                className="text-gray-300 hover:text-red-500 transition-colors flex justify-center p-2"
              >
                🗑
              </button>
            </div>
          ))}

          {/* Click to add helper row */}
          <div 
            onClick={handleAddField}
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-blue-50 bg-blue-50/20 rounded-xl cursor-pointer hover:bg-blue-50/40 transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mb-2 group-hover:scale-110 transition-transform">
              +
            </div>
            <span className="text-[10px] font-black text-blue-900/60 uppercase tracking-[0.2em]">
              Click to add another field row
            </span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col gap-4">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-sm font-bold rounded-xl border border-red-100 animate-in slide-in-from-top-2">
            ⚠️ {error}
          </div>
        )}
        
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-8 py-3 rounded-lg text-gray-500 font-bold hover:bg-gray-100 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-8 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-200 disabled:opacity-70 flex items-center gap-2"
          >
            {isSubmitting ? 'Saving...' : template ? 'Guardar Cambios' : 'Save Template'}
          </button>
        </div>
      </div>
    </div>
  );
}