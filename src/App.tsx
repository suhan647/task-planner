import React from 'react';
import { TaskProvider } from './context/TaskContext';
import { Calendar } from './components/Calendar';
import { Sidebar } from './components/Sidebar';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Calendar as CalendarIcon } from 'lucide-react';

function AppContent() {
  useLocalStorage();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Task Planner</h1>
              <p className="text-sm text-gray-600">
                Drag across days to create • Click tasks to edit • Drag to move • Use filters to organize
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-88px)]">
        <Sidebar />
        <Calendar />
      </div>
    </div>
  );
}

function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}

export default App;