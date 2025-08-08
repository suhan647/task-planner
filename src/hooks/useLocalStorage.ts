import { useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { loadTasksFromStorage } from '../utils/taskUtils';

export function useLocalStorage() {
  const { dispatch } = useTaskContext();

  useEffect(() => {
    const tasks = loadTasksFromStorage();
    if (tasks.length > 0) {
      dispatch({ type: 'LOAD_TASKS', tasks });
    }
  }, [dispatch]);
}