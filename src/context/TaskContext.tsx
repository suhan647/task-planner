import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Task, TaskCategory, TaskFilters } from '../types/Task';

interface TaskState {
  tasks: Task[];
  filters: TaskFilters;
  draggedTask: Task | null;
  isCreating: boolean;
  creationDates: { startDate: Date; endDate: Date } | null;
}

type TaskAction =
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'UPDATE_TASK'; task: Task }
  | { type: 'DELETE_TASK'; taskId: string }
  | { type: 'SET_FILTERS'; filters: Partial<TaskFilters> }
  | { type: 'SET_DRAGGED_TASK'; task: Task | null }
  | { type: 'START_CREATION'; startDate: Date; endDate: Date }
  | { type: 'CANCEL_CREATION' }
  | { type: 'LOAD_TASKS'; tasks: Task[] };

const initialState: TaskState = {
  tasks: [],
  filters: {
    categories: [],
    timeFrame: null,
  },
  draggedTask: null,
  isCreating: false,
  creationDates: null,
};

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.task],
        isCreating: false,
        creationDates: null,
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.task.id ? action.task : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.taskId),
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.filters },
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
      return {
        ...state,
        tasks: action.tasks,
      };
    default:
      return state;
  }
}

const TaskContext = createContext<{
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
} | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  return (
    <TaskContext.Provider value={{ state, dispatch }}>
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