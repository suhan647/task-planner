import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Task, TaskCategory, TaskFilters } from '../types/Task';

interface TaskState {
  tasks: Task[];
  filters: TaskFilters;
  draggedTask: Task | null;
  isCreating: boolean;
  creationDates: { startDate: Date; endDate: Date } | null;
  searchQuery: string;
}

type TaskAction =
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'UPDATE_TASK'; task: Task }
  | { type: 'DELETE_TASK'; taskId: string }
  | { type: 'SET_FILTERS'; filters: Partial<TaskFilters> }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'SET_DRAGGED_TASK'; task: Task | null }
  | { type: 'START_CREATION'; startDate: Date; endDate: Date }
  | { type: 'CANCEL_CREATION' }
  | { type: 'LOAD_TASKS'; tasks: Task[] }
  | { type: 'RESET_STATE' };

const initialState: TaskState = {
  tasks: [],
  filters: {
    categories: [],
    timeFrame: null,
  },
  draggedTask: null,
  isCreating: false,
  creationDates: null,
  searchQuery: '',
};

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'ADD_TASK':
      console.log('Adding task:', action.task);
      return {
        ...state,
        tasks: [...state.tasks, action.task],
        isCreating: false,
        creationDates: null,
      };
    case 'UPDATE_TASK':
      console.log('Updating task:', action.task);
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.task.id ? action.task : task
        ),
      };
    case 'DELETE_TASK':
      console.log('Deleting task:', action.taskId);
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.taskId),
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.filters },
      };
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.query,
      };
    case 'SET_DRAGGED_TASK':
      return {
        ...state,
        draggedTask: action.task,
      };
    case 'START_CREATION':
      return {
        ...state,
        isCreating: true,
        creationDates: {
          startDate: action.startDate,
          endDate: action.endDate,
        },
      };
    case 'CANCEL_CREATION':
      return {
        ...state,
        isCreating: false,
        creationDates: null,
      };
    case 'LOAD_TASKS':
      console.log('Loading tasks into state:', action.tasks);
      return {
        ...state,
        tasks: action.tasks,
      };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

const TaskContext = createContext<{
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
  getFilteredTasks: () => Task[];
} | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Helper function to get filtered tasks
  const getFilteredTasks = () => {
    let filteredTasks = [...state.tasks];

    // Apply search filter
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (state.filters.categories.length > 0) {
      filteredTasks = filteredTasks.filter(task =>
        state.filters.categories.includes(task.category)
      );
    }

    // Apply time frame filter
    if (state.filters.timeFrame) {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      let endOfPeriod = new Date(startOfWeek);
      switch (state.filters.timeFrame) {
        case 'week':
          endOfPeriod.setDate(startOfWeek.getDate() + 7);
          break;
        case 'twoWeeks':
          endOfPeriod.setDate(startOfWeek.getDate() + 14);
          break;
        case 'threeWeeks':
          endOfPeriod.setDate(startOfWeek.getDate() + 21);
          break;
      }

      filteredTasks = filteredTasks.filter(task =>
        task.startDate >= startOfWeek && task.startDate < endOfPeriod
      );
    }

    return filteredTasks;
  };

  return (
    <TaskContext.Provider value={{ 
      state, 
      dispatch, 
      getFilteredTasks 
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}