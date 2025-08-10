import { useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { loadTasksFromStorage, saveTasksToStorage, clearTasksFromStorage } from '../utils/taskUtils';

export function useLocalStorage() {
  const { state, dispatch } = useTaskContext();

  // Load tasks from localStorage on mount
  useEffect(() => {
    console.log('useLocalStorage effect running...');
    const tasks = loadTasksFromStorage();
    console.log('Loaded tasks from storage:', tasks);
    console.log('Number of tasks loaded:', tasks.length);
    
    if (tasks.length > 0) {
      console.log('Loading existing tasks from localStorage');
      dispatch({ type: 'LOAD_TASKS', tasks });
    } else {
      console.log('No tasks found in localStorage, starting with empty state');
    }
  }, [dispatch]);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    console.log('Saving tasks to localStorage:', state.tasks);
    saveTasksToStorage(state.tasks);
  }, [state.tasks]);

  // Function to manually clear localStorage (for debugging)
  const clearStorage = () => {
    clearTasksFromStorage();
    dispatch({ type: 'RESET_STATE' });
  };

  // Expose clear function for debugging (optional)
  if (typeof window !== 'undefined') {
    (window as any).clearTaskStorage = clearStorage;
  }
}