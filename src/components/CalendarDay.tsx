import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { CalendarDate, Task } from '../types/Task';
import { TaskBar } from './TaskBar';
import { formatDate, isSameDay, getDaysBetween } from '../utils/dateUtils';

interface CalendarDayProps {
  date: CalendarDate;
  tasks: Task[];
  onSelectionStart: (date: Date) => void;
  onSelectionUpdate: (date: Date) => void;
  isInSelection: boolean;
  isSelecting: boolean;
  selectionStart: Date | null;
  selectionEnd: Date | null;
  calendarStartDate: Date;
  dayWidth: number;
  onTaskEdit: (task: Task) => void;
  onTaskResize: (taskId: string, newStartDate: Date, newEndDate: Date) => void;
  isDragging?: boolean;
  currentDropTarget?: Date | null;
}

export function CalendarDay({ 
  date, 
  tasks, 
  onSelectionStart,
  onSelectionUpdate,
  isInSelection,
  isSelecting,
  selectionStart,
  selectionEnd,
  calendarStartDate,
  dayWidth, 
  onTaskEdit,
  onTaskResize,
  isDragging = false,
  currentDropTarget
}: CalendarDayProps) {
  const cellRef = useRef<HTMLDivElement>(null);
  const [isDraggingTask, setIsDraggingTask] = useState(false);

  const { isOver, setNodeRef } = useDroppable({
    id: formatDate(date.date),
    data: {
      type: 'day',
      date: date.date,
    },
  });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    // Check global drag state first, then local drag state
    if (e.button !== 0 || isDragging || isDraggingTask) return;
    
    onSelectionStart(date.date);
  }, [date.date, isDragging, isDraggingTask, onSelectionStart]);

  const handleMouseEnter = useCallback(() => {
    // Check global drag state first, then local drag state
    if (isSelecting && !isDragging && !isDraggingTask) {
      onSelectionUpdate(date.date);
    }
  }, [isSelecting, isDragging, isDraggingTask, date.date, onSelectionUpdate]);

  // Reset local dragging state when global dragging state changes
  useEffect(() => {
    // Synchronize local drag state with global drag state
    setIsDraggingTask(isDragging);
  }, [isDragging]);

  // Filter tasks that span this day
  const dayTasks = tasks.filter(task => {
    const taskDays = getDaysBetween(task.startDate, task.endDate);
    return taskDays.some(taskDay => isSameDay(taskDay, date.date));
  });

  // Debug logging
  if (dayTasks.length > 0) {
    console.log('📅 CALENDAR DAY DEBUG:', {
      date: formatDate(date.date),
      totalTasks: tasks.length,
      dayTasks: dayTasks.length,
      taskIds: dayTasks.map(t => t.id)
    });
  }

  // Render task bars for each day the task spans
  const taskBars = dayTasks.map((task, index) => {
    const taskDays = getDaysBetween(task.startDate, task.endDate);
    const isFirstDay = isSameDay(task.startDate, date.date);
    const isLastDay = isSameDay(task.endDate, date.date);
    
    return (
      <TaskBar
        key={task.id}
        task={task}
        calendarStartDate={calendarStartDate}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        dayWidth={dayWidth}
        onTaskEdit={onTaskEdit}
        onDragStart={() => setIsDraggingTask(true)}
        onDragEnd={() => setIsDraggingTask(false)}
        onTaskResize={onTaskResize}
      />
    );
  });

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (cellRef.current !== node) {
          cellRef.current = node;
        }
      }}
      data-day={formatDate(date.date)}
      className={`
        relative h-28 border-r border-b border-gray-200 cursor-pointer select-none
        transition-colors duration-150
        ${date.isCurrentMonth ? 'bg-white hover:bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'}
        ${date.isToday ? 'bg-blue-100 border-blue-300' : ''}
        ${isOver ? 'bg-green-100' : ''}
        ${isInSelection ? 'bg-blue-200 border-blue-400' : ''}
        ${currentDropTarget === date.date ? 'bg-blue-300 border-blue-500' : ''}
      `}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
    >
      <div className={`
        absolute top-1 left-1 text-sm font-medium
        ${date.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
        ${date.isToday ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs' : ''}
      `}>
        {date.date.getDate()}
      </div>
      
      {/* Task bars container */}
      <div className="absolute top-8 left-0 right-0 space-y-1">
        {taskBars}
      </div>
    </div>
  );
}