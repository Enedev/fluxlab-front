/**
 * Reports Page
 * 
 * Manage and view reports
 * Ready for backend data integration
 */

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function ReportsPage() {
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
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          </div>
        </main>
      </div>
    </div>
  );
}
