import { Task, TaskCategory } from '../types/Task';

export function generateTaskId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function getTaskColor(category: TaskCategory): string {
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

export function getTaskTextColor(category: TaskCategory): string {
  return 'text-white';
}

export function clearTasksFromStorage(): void {
  try {
    console.log('Clearing all tasks from localStorage...');
    localStorage.removeItem('task-planner-tasks');
    console.log('Tasks cleared successfully');
  } catch (error) {
    console.error('Failed to clear tasks from localStorage:', error);
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  try {
    console.log('Saving tasks to localStorage:', tasks);
    localStorage.setItem('task-planner-tasks', JSON.stringify(tasks));
    console.log('Tasks saved successfully');
  } catch (error) {
    console.error('Failed to save tasks to localStorage:', error);
  }
}

export function loadTasksFromStorage(): Task[] {
  try {
    console.log('Loading tasks from localStorage...');
    console.log('All localStorage keys:', Object.keys(localStorage));
    const stored = localStorage.getItem('task-planner-tasks');
    console.log('Raw stored data:', stored);
    
    if (!stored) {
      console.log('No stored tasks found');
      return [];
    }
    
    const parsed = JSON.parse(stored);
    console.log('Parsed tasks:', parsed);
    
    const tasks = parsed.map((task: any) => ({
      ...task,
      startDate: new Date(task.startDate),
      endDate: new Date(task.endDate),
      createdAt: new Date(task.createdAt),
    }));
    
    console.log('Converted tasks with dates:', tasks);
    return tasks;
  } catch (error) {
    console.error('Failed to load tasks from localStorage:', error);
    return [];
  }
}