import React from 'react';
import { TaskProvider, useTaskContext } from './context/TaskContext';
import { Calendar } from './components/Calendar';
import { Sidebar } from './components/Sidebar';
import { SearchBar } from './components/SearchBar';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Calendar as CalendarIcon } from 'lucide-react';

function AppContent() {
  useLocalStorage();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center gap-6">
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
            
            {/* Search Bar */}
            <SearchBar />
            
            {/* Search Results Indicator */}
            <SearchResultsIndicator />
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

// Search Results Indicator Component
function SearchResultsIndicator() {
  const { state, getFilteredTasks } = useTaskContext();
  
  if (!state.searchQuery.trim()) return null;
  
  const filteredTasks = getFilteredTasks();
  const totalTasks = state.tasks.length;
  
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
      <span>🔍</span>
      <span>{filteredTasks.length} of {totalTasks} tasks</span>
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