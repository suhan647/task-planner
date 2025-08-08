export interface Task {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  category: TaskCategory;
  createdAt: Date;
}

export type TaskCategory = 'To Do' | 'In Progress' | 'Review' | 'Completed';

export interface TaskFilters {
  categories: TaskCategory[];
  timeFrame: 'week' | 'twoWeeks' | 'threeWeeks' | null;
}

export interface CalendarDate {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}