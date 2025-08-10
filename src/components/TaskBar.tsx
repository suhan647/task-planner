import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types/Task';
import { getTaskColor, getTaskTextColor } from '../utils/taskUtils';
import { formatDate, getDaysBetween, isSameDay } from '../utils/dateUtils';
import { TaskTooltip } from './TaskTooltip';

interface TaskBarProps {
  task: Task;
  calendarStartDate: Date;
  isFirstDay?: boolean;
  isLastDay?: boolean;
  dayWidth: number;
  onTaskEdit: (task: Task) => void;
  onTaskResize: (task: Task, newStartDate: Date, newEndDate: Date) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export function TaskBar({ 
  task, 
  calendarStartDate, 
  isFirstDay, 
  isLastDay, 
  dayWidth, 
  onTaskEdit,
  onTaskResize,
  onDragStart,
  onDragEnd
}: TaskBarProps) {
  const [isResizing, setIsResizing] = useState<'start' | 'end' | null>(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [originalDates, setOriginalDates] = useState<{ start: Date; end: Date } | null>(null);
  const [isDraggingTask, setIsDraggingTask] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isHoveringResize, setIsHoveringResize] = useState(false);
  const [activeResizeHandle, setActiveResizeHandle] = useState<'start' | 'end' | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
    disabled: isResizing !== null || activeResizeHandle !== null,
  });

  // Handle drag start/end
  React.useEffect(() => {
    if (isDragging) {
      setIsDraggingTask(true);
      onDragStart();
    } else {
      setIsDraggingTask(false);
      onDragEnd();
    }
  }, [isDragging, onDragStart, onDragEnd]);

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const taskDays = getDaysBetween(task.startDate, task.endDate);
  const taskDuration = taskDays.length;

  // Each task bar fills the full width of one day cell
  const taskWidth = dayWidth;

  const handleResizeStart = (edge: 'start' | 'end', e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Starting resize for edge:', edge);
    setActiveResizeHandle(edge);
    setIsResizing(edge);
    setResizeStartX(e.clientX);
    setOriginalDates({ start: new Date(task.startDate), end: new Date(task.endDate) });

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      console.log('Resizing...');
      if (!originalDates) return;
      
      const deltaX = moveEvent.clientX - resizeStartX;
      const daysDelta = Math.round(deltaX / dayWidth);
      console.log('Days delta:', daysDelta);
      
      let newStartDate = new Date(originalDates.start);
      let newEndDate = new Date(originalDates.end);
      
      if (edge === 'start') {
        newStartDate.setDate(originalDates.start.getDate() + daysDelta);
        // Ensure start date doesn't go past end date
        if (newStartDate >= originalDates.end) {
          newStartDate = new Date(originalDates.end);
          newStartDate.setDate(newStartDate.getDate() - 1);
        }
      } else {
        newEndDate.setDate(originalDates.end.getDate() + daysDelta);
        // Ensure end date doesn't go before start date
        if (newEndDate <= originalDates.start) {
          newEndDate = new Date(originalDates.start);
          newEndDate.setDate(newEndDate.getDate() + 1);
        }
      }
      
      onTaskResize(task, newStartDate, newEndDate);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      upEvent.preventDefault();
      upEvent.stopPropagation();
      console.log('Ending resize');
      setIsResizing(null);
      setActiveResizeHandle(null);
      setOriginalDates(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTaskClick = (e: React.MouseEvent) => {
    if (isResizing || isDraggingTask || isDragging || activeResizeHandle) return;
    e.stopPropagation();
    onTaskEdit(task);
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (isResizing || isDraggingTask) return;
    e.stopPropagation();
    setTooltipPosition({ x: e.clientX, y: e.clientY });
    setShowTooltip(true);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTooltip(false);
    if (!isResizing) {
      setIsHoveringResize(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (showTooltip) {
      e.stopPropagation();
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }
  };

  // Don't show drag listeners when resizing or mouse is down on resize handle
  const dragListeners = (isResizing !== null || activeResizeHandle !== null) ? {} : listeners;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...dragListeners}
        {...attributes}
        className={`
          absolute top-1 z-10 h-7 rounded-md px-2 text-xs font-medium flex items-center
          transition-all duration-150 shadow-sm hover:shadow-md select-none group
          ${getTaskColor(task.category)} ${getTaskTextColor(task.category)}
          ${isDragging ? 'opacity-60 scale-105 z-50' : ''}
          ${taskDuration === 1 ? 'rounded-md' : ''}
          ${isFirstDay && taskDuration > 1 ? 'rounded-l-md' : 'rounded-l-none'}
          ${isLastDay && taskDuration > 1 ? 'rounded-r-md' : 'rounded-r-none'}
          ${!isFirstDay && taskDuration > 1 ? 'rounded-l-none rounded-r-none' : ''}
          ${activeResizeHandle ? 'cursor-ew-resize z-30' : isDraggingTask ? 'cursor-grabbing' : 'cursor-grab'}
        `}
        style={{ 
          ...style, 
          width: '100%', // Fill the full day cell width
          minWidth: '60px',
        }}
        onClick={handleTaskClick}
        onMouseDown={(e) => {
        }
        }
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        {/* Left resize handle */}
        {isFirstDay && (
          <div
            className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize bg-transparent hover:bg-white hover:bg-opacity-30 rounded-l-md transition-all z-50"
            onMouseDown={(e) => handleResizeStart('start', e)}
            title="Drag to adjust start date"
          />
        )}
        
        <span className={`truncate flex-1 pointer-events-none ${!isFirstDay ? 'opacity-0' : ''}`}>
          {task.title}
        </span>
        
        {/* Right resize handle */}
        {isLastDay && (
          <div
            className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize bg-transparent hover:bg-white hover:bg-opacity-30 rounded-r-md transition-all z-50"
            onMouseDown={(e) => handleResizeStart('end', e)}
            title="Drag to adjust end date"
          />
        )}
      </div>

      {/* Custom Tooltip */}
      <TaskTooltip
        task={task}
        isVisible={showTooltip && !isDragging && !isResizing && !activeResizeHandle}
        position={tooltipPosition}
      />
    </>
  );
}