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

export function saveTasksToStorage(tasks: Task[]): void {
  try {
    localStorage.setItem('task-planner-tasks', JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save tasks to localStorage:', error);
  }
}

export function loadTasksFromStorage(): Task[] {
  try {
    const stored = localStorage.getItem('task-planner-tasks');
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map((task: any) => ({
      ...task,
      startDate: new Date(task.startDate),
      endDate: new Date(task.endDate),
      createdAt: new Date(task.createdAt),
    }));
  } catch (error) {
    console.error('Failed to load tasks from localStorage:', error);
    return [];
  }
}