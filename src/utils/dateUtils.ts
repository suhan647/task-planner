import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, addDays, subWeeks, isWithinInterval } from 'date-fns';
import { CalendarDate } from '../types/Task';

export function getMonthDates(date: Date): CalendarDate[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  return eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  }).map(day => ({
    date: day,
    isCurrentMonth: isSameMonth(day, date),
    isToday: isToday(day),
  }));
}

export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatDisplayDate(date: Date): string {
  return format(date, 'MMM d, yyyy');
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return formatDate(date1) === formatDate(date2);
}

export function getDaysBetween(startDate: Date, endDate: Date): Date[] {
  const days: Date[] = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    days.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  
  return days;
}

export function getDatesBetween(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Normalize to start of day
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  let current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

export function isDateInTimeFrame(date: Date, timeFrame: 'week' | 'twoWeeks' | 'threeWeeks'): boolean {
  const now = new Date();
  let cutoffDate: Date;
  
  switch (timeFrame) {
    case 'week':
      cutoffDate = addDays(now, 7);
      break;
    case 'twoWeeks':
      cutoffDate = addDays(now, 14);
      break;
    case 'threeWeeks':
      cutoffDate = addDays(now, 21);
      break;
    default:
      return true;
  }
  
  // Show tasks that start within the timeframe from today
  return date >= now && date <= cutoffDate;
}