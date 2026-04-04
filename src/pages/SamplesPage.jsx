/**
 * Samples Page
 * 
 * Manage and view samples and templates with tab-based navigation
 * Integrated with Supabase authentication and backend API
 */

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import SamplesTable from '../components/SamplesTable';
import TemplatesTable from '../components/TemplatesTable';

export default function SamplesPage() {
  const [activeTab, setActiveTab] = useState('samples');

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
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Muestras y Templates</h1>
              <p className="text-gray-600">Gestiona las muestras de laboratorio y los templates de datos</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('samples')}
                className={`px-4 py-3 font-medium transition relative ${
                  activeTab === 'samples'
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Muestras
                {activeTab === 'samples' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-4 py-3 font-medium transition relative ${
                  activeTab === 'templates'
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Templates
                {activeTab === 'templates' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                )}
              </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'samples' && <SamplesTable />}
              {activeTab === 'templates' && <TemplatesTable />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
