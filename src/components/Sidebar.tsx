import React, { useState } from 'react';
import { TaskCategory } from '../types/Task';
import { useTaskContext } from '../context/TaskContext';
import { Filter, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const categories: TaskCategory[] = ['To Do', 'In Progress', 'Review', 'Completed'];
const timeFrames = [
  { key: 'week' as const, label: 'Tasks within 1 week' },
  { key: 'twoWeeks' as const, label: 'Tasks within 2 weeks' },
  { key: 'threeWeeks' as const, label: 'Tasks within 3 weeks' },
];

export function Sidebar() {
  const { state, dispatch } = useTaskContext();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleCategoryChange = (category: TaskCategory, checked: boolean) => {
    const newCategories = checked
      ? [...state.filters.categories, category]
      : state.filters.categories.filter(c => c !== category);
    
    dispatch({
      type: 'SET_FILTERS',
      filters: { categories: newCategories },
    });
  };

  const handleTimeFrameChange = (timeFrame: 'week' | 'twoWeeks' | 'threeWeeks') => {
    dispatch({
      type: 'SET_FILTERS',
      filters: { 
        timeFrame: state.filters.timeFrame === timeFrame ? null : timeFrame 
      },
    });
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-80'} bg-white shadow-lg transition-all duration-300 ease-in-out relative`}>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:bg-gray-50 transition-colors z-10"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        )}
      </button>

      <div className={`${isCollapsed ? 'p-3' : 'p-6'} overflow-y-auto h-full`}>
        {!isCollapsed && (
          <>
            <div className="flex items-center gap-2 mb-6">
              <Filter className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            </div>

            {/* Category Filters */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-gray-500" />
                <h3 className="font-medium text-gray-900">Categories</h3>
              </div>
              <div className="space-y-3">
                {categories.map(category => (
                  <label
                    key={category}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={state.filters.categories.includes(category)}
                      onChange={(e) => handleCategoryChange(category, e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 font-medium">{category}</span>
                    <div className={`w-3 h-3 rounded-full ml-auto ${getCategoryColor(category)}`} />
                  </label>
                ))}
              </div>
            </div>

            {/* Time-Based Filters */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-gray-500" />
                <h3 className="font-medium text-gray-900">Time Frame</h3>
              </div>
              <div className="space-y-3">
                {timeFrames.map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  >
                    <input
                      type="radio"
                      name="timeFrame"
                      checked={state.filters.timeFrame === key}
                      onChange={() => handleTimeFrameChange(key)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
              {state.filters.timeFrame && (
                <button
                  onClick={() => dispatch({ type: 'SET_FILTERS', filters: { timeFrame: null } })}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Clear time filter
                </button>
              )}
            </div>

            {/* Task Statistics */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Task Overview</h3>
              <div className="space-y-2 text-sm">
                {categories.map(category => {
                  const count = state.tasks.filter(task => task.category === category).length;
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`} />
                        <span className="text-gray-700">{category}</span>
                      </div>
                      <span className="font-medium text-gray-900">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Collapsed State - Show only icons */}
        {isCollapsed && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <Filter className="h-6 w-6 text-gray-600" />
            </div>
            <div className="space-y-4">
              {categories.map(category => (
                <div key={category} className="flex justify-center">
                  <div className={`w-4 h-4 rounded-full ${getCategoryColor(category)}`} />
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <Clock className="h-6 w-6 text-gray-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getCategoryColor(category: TaskCategory): string {
  switch (category) {
    case 'To Do':
      return 'bg-blue-500';
    case 'In Progress':
      return 'bg-yellow-500';
    case 'Review':
      return 'bg-purple-500';
    case 'Completed':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
}