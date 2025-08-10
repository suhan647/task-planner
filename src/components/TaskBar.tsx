import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { addDays } from 'date-fns';
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
  onDragStart: () => void;
  onDragEnd: () => void;
  onTaskResize: (taskId: string, newStartDate: Date, newEndDate: Date) => void;
}

export function TaskBar({ 
  task, 
  calendarStartDate, 
  isFirstDay, 
  isLastDay, 
  dayWidth, 
  onTaskEdit,
  onDragStart,
  onDragEnd,
  onTaskResize
}: TaskBarProps) {
  const [isDraggingTask, setIsDraggingTask] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<'left' | 'right' | null>(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartDates, setResizeStartDates] = useState<{ startDate: Date; endDate: Date } | null>(null);

  const taskRef = useRef<HTMLDivElement>(null);
  const leftHandleRef = useRef<HTMLDivElement>(null);
  const rightHandleRef = useRef<HTMLDivElement>(null);

  // Calculate task properties early to avoid hoisting issues
  const taskDays = getDaysBetween(task.startDate, task.endDate);
  const taskDuration = taskDays.length;
  const showResizeHandles = taskDuration >= 1; // Show handles for all tasks, including single-day

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
    disabled: false, // Always allow dragging - we'll handle resize conflicts manually
  });

  // Debug logging for single-day tasks
  useEffect(() => {
    if (taskDuration === 1) {
      console.log('🔍 SINGLE-DAY TASK DEBUG:', {
        taskId: task.id,
        title: task.title,
        startDate: task.startDate,
        endDate: task.endDate,
        isFirstDay,
        isLastDay,
        showResizeHandles,
        isResizing,
        hasListeners: listeners?.onMouseDown ? true : false
      });
    }
  }, [task.id, task.title, task.startDate, task.endDate, isFirstDay, isLastDay, showResizeHandles, isResizing, listeners, taskDuration]);

  // Handle drag start/end
  React.useEffect(() => {
    if (isDragging && !isResizing) { // Only handle drag if not resizing
      console.log('🚀 DRAG STARTED for task:', task.title);
      setIsDraggingTask(true);
      onDragStart();
    } else if (!isDragging) {
      console.log('🛑 DRAG ENDED for task:', task.title);
      setIsDraggingTask(false);
      onDragEnd();
    }
  }, [isDragging, isResizing, onDragStart, onDragEnd, task.title]);

  // Custom drag handler that completely blocks drag when clicking on resize areas
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    console.log('🖱️ DRAG START ATTEMPT:', {
      taskId: task.id,
      taskTitle: task.title,
      isResizing,
      target: e.target,
      isResizeHandle: (e.target as HTMLElement).closest('[data-resize-handle="true"]')
    });
    
    // Clear any stuck resize attributes that might block drag
    if (document.documentElement.hasAttribute('data-task-resizing')) {
      const resizingTaskId = document.documentElement.getAttribute('data-task-resizing');
      if (resizingTaskId !== task.id) {
        console.log('🧹 CLEARING STUCK RESIZE ATTRIBUTE from another task:', resizingTaskId);
        document.documentElement.removeAttribute('data-task-resizing');
      }
    }
    
    // If we're resizing, completely block drag
    if (isResizing) {
      console.log('❌ BLOCKING DRAG - Currently resizing');
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // Check if the click target is a resize handle
    const target = e.target as HTMLElement;
    if (target.closest('[data-resize-handle="true"]')) {
      console.log('❌ BLOCKING DRAG - Clicked on resize handle');
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // If not a resize handle and not resizing, allow normal drag behavior
    if (listeners?.onMouseDown) {
      console.log('✅ ALLOWING DRAG - Normal drag operation');
      listeners.onMouseDown(e);
    } else {
      console.log('⚠️ WARNING - No drag listeners available');
    }
  }, [listeners, isResizing, task.id, task.title]);

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const handleTaskClick = (e: React.MouseEvent) => {
    if (isDraggingTask || isDragging || isResizing) return;
    e.stopPropagation();
    onTaskEdit(task);
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (isDraggingTask || isResizing) return;
    e.stopPropagation();
    setTooltipPosition({ x: e.clientX, y: e.clientY });
    setShowTooltip(true);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTooltip(false);
    // if (!isResizing) {
    //   setIsHoveringResize(false);
    // }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (showTooltip) {
      e.stopPropagation();
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, direction: 'left' | 'right') => {
    console.log('🎯 RESIZE START:', direction, e.clientX, 'Task:', task.title);
    e.preventDefault();
    e.stopPropagation();
    
    // Immediately disable dragging
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStartX(e.clientX);
    setResizeStartDates({
      startDate: new Date(task.startDate),
      endDate: new Date(task.endDate)
    });
    
    // Set global resize state with a unique identifier
    document.documentElement.setAttribute('data-task-resizing', task.id);
    
    // Force disable any potential drag
    if (taskRef.current) {
      taskRef.current.style.pointerEvents = 'none';
    }
  }, [task.startDate, task.endDate, task.title, task.id]);

  // Handle resize move
  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeDirection || !resizeStartDates) {
      return;
    }

    // Prevent any default drag behavior
    e.preventDefault();
    e.stopPropagation();

    const deltaX = e.clientX - resizeStartX;
    const deltaDays = deltaX / dayWidth; // Allow negative values for backward movement
    
    console.log('🔄 RESIZE MOVE:', {
      direction: resizeDirection,
      deltaX,
      deltaDays,
      dayWidth,
      originalStart: resizeStartDates.startDate,
      originalEnd: resizeStartDates.endDate
    });
    
    // Use Math.round for precise day boundaries - this makes resize accurate
    const roundedDeltaDays = Math.round(deltaDays);
    
    // Only update if we've moved to a new day boundary
    if (roundedDeltaDays === 0) return;

    let newStartDate = new Date(resizeStartDates.startDate);
    let newEndDate = new Date(resizeStartDates.endDate);

    if (resizeDirection === 'left') {
      // For left handle: moving left (negative deltaX) should decrease start date
      // moving right (positive deltaX) should increase start date
      newStartDate = addDays(resizeStartDates.startDate, roundedDeltaDays);
      
      console.log('📅 LEFT HANDLE - New start date:', newStartDate);
      
      // Ensure start date doesn't go after end date
      if (newStartDate > newEndDate) {
        newStartDate = new Date(newEndDate);
        console.log('⚠️ LEFT HANDLE - Constrained start date to end date:', newStartDate);
      }
      
      // Ensure start date doesn't go before a reasonable minimum (e.g., calendar start)
      const minDate = new Date(calendarStartDate);
      if (newStartDate < minDate) {
        newStartDate = new Date(minDate);
        console.log('⚠️ LEFT HANDLE - Constrained start date to calendar start:', newStartDate);
      }
      
    } else if (resizeDirection === 'right') {
      // For right handle: moving right (positive deltaX) should increase end date
      // moving left (negative deltaX) should decrease end date
      newEndDate = addDays(resizeStartDates.endDate, roundedDeltaDays);
      
      console.log('📅 RIGHT HANDLE - New end date:', newEndDate);
      
      // Ensure end date doesn't go before start date
      if (newEndDate < newStartDate) {
        newEndDate = new Date(newStartDate);
        console.log('⚠️ RIGHT HANDLE - Constrained end date to start date:', newEndDate);
      }
      
      // Ensure end date doesn't go beyond a reasonable maximum (e.g., calendar end)
      const maxDate = new Date(calendarStartDate);
      maxDate.setMonth(maxDate.getMonth() + 2); // Allow 2 months ahead
      if (newEndDate > maxDate) {
        newEndDate = new Date(maxDate);
        console.log('⚠️ RIGHT HANDLE - Constrained end date to calendar max:', newEndDate);
      }
    }

    console.log('✅ FINAL DATES:', {
      start: newStartDate,
      end: newEndDate,
      duration: Math.ceil((newEndDate.getTime() - newStartDate.getTime()) / (1000 * 60 * 60 * 24))
    });
    
    // Update immediately on every mouse movement for smooth resizing
    onTaskResize(task.id, newStartDate, newEndDate);
  }, [isResizing, resizeDirection, resizeStartX, resizeStartDates, dayWidth, task.id, onTaskResize, calendarStartDate]);

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    console.log('🏁 RESIZE END');
    setIsResizing(false);
    setResizeDirection(null);
    setResizeStartX(0);
    setResizeStartDates(null);
    
    // Clear global resize state immediately
    document.documentElement.removeAttribute('data-task-resizing');
    
    // Re-enable pointer events
    if (taskRef.current) {
      taskRef.current.style.pointerEvents = 'auto';
    }
  }, []);

  // Global mouse event listeners for resize
  useEffect(() => {
    if (isResizing) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Call resize move on every mouse movement for smooth resizing
        handleResizeMove(e);
      };
      
      const handleGlobalMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleResizeEnd();
      };
      
      // Add listeners with capture phase to intercept events early
      // Use passive: false to ensure we can prevent default behavior
      document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false, capture: true });
      document.addEventListener('mouseup', handleGlobalMouseUp, { passive: false, capture: true });
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove, { capture: true });
        document.removeEventListener('mouseup', handleGlobalMouseUp, { capture: true });
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  // Cleanup effect to ensure resize attribute is cleared on unmount
  useEffect(() => {
    return () => {
      // Clear any lingering resize state when component unmounts
      if (document.documentElement.hasAttribute('data-task-resizing')) {
        const resizingTaskId = document.documentElement.getAttribute('data-task-resizing');
        if (resizingTaskId === task.id) {
          document.documentElement.removeAttribute('data-task-resizing');
          console.log('🧹 CLEANUP: Removed resize attribute for unmounted task:', task.id);
        }
      }
    };
  }, [task.id]);

  return (
    <div className="relative">
      {/* Main draggable task bar */}
      <div
        ref={(node) => {
          setNodeRef(node);
          if (taskRef.current !== node) {
            taskRef.current = node;
          }
        }}
        style={style}
        {...listeners}
        {...attributes}
        onMouseDown={handleDragStart}
        className={`
          relative top-1 z-10 h-7 rounded-md border border-white border-opacity-30
          transition-all duration-150 shadow-sm hover:shadow-lg select-none group
          ${getTaskColor(task.category)} ${getTaskTextColor(task.category)}
          ${isDragging ? 'opacity-60 scale-105 z-50' : ''}
          ${isResizing ? 'ring-2 ring-blue-500 ring-opacity-75' : ''}
          ${taskDuration === 1 ? 'rounded-md' : ''}
          ${isFirstDay && taskDuration > 1 ? 'rounded-l-md' : 'rounded-l-none'}
          ${isLastDay && taskDuration > 1 ? 'rounded-r-md' : 'rounded-r-none'}
          ${!isFirstDay && taskDuration > 1 ? 'rounded-l-none rounded-r-none' : ''}
          ${isDraggingTask ? 'cursor-grabbing' : 'cursor-grab'}
          ${isResizing ? 'cursor-ew-resize' : ''}
          ${taskDuration >= 1 ? 'hover:scale-105 hover:shadow-lg' : ''}
        `}
        style={{ 
          ...style, 
          width: '100%',
          minWidth: '60px',
        }}
        onClick={handleTaskClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        {/* Centered task title only */}
        <div className="w-full h-full flex items-center justify-center pointer-events-none">
          <span className={`text-xs font-medium ${!isFirstDay ? 'opacity-0' : ''}`}>
            {task.title}
          </span>
        </div>
        
      </div>

      {/* Left resize handle - Show for all tasks, including single-day */}
      {isFirstDay && showResizeHandles && (
        <div
          ref={leftHandleRef}
          data-resize-handle="true"
          className="absolute top-1 left-0 w-1 h-7 cursor-ew-resize bg-white bg-opacity-30 hover:bg-opacity-60 transition-all duration-200 z-50 rounded-l-sm"
          style={{ 
            pointerEvents: 'auto',
            // Position to overlay the left edge of the task bar
            left: '0px'
          }}
          onMouseDown={(e) => {
            console.log('🖱️ LEFT HANDLE MOUSE DOWN - PREVENTING DRAG', {
              taskId: task.id,
              taskDuration,
              isFirstDay,
              isLastDay
            });
            e.preventDefault();
            e.stopPropagation();
            // Completely block any drag events
            e.nativeEvent.stopImmediatePropagation();
            // Force the resize to start
            handleResizeStart(e, 'left');
          }}
          onMouseEnter={(e) => {
            console.log('🖱️ LEFT HANDLE MOUSE ENTER');
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseLeave={(e) => {
            console.log('🖱️ LEFT HANDLE MOUSE LEAVE');
            e.preventDefault();
            e.stopPropagation();
          }}
          title="Drag to resize task duration (left edge)"
        />
      )}

      {/* Right resize handle - Show for all tasks, including single-day */}
      {isLastDay && showResizeHandles && (
        <div
          ref={rightHandleRef}
          data-resize-handle="true"
          className="absolute top-1 right-0 w-1 h-7 cursor-ew-resize bg-white bg-opacity-30 hover:bg-opacity-60 transition-all duration-200 z-50 rounded-r-sm"
          style={{ 
            pointerEvents: 'auto',
            // Position to overlay the right edge of the task bar
            right: '0px'
          }}
          onMouseDown={(e) => {
            console.log('🖱️ RIGHT HANDLE MOUSE DOWN - PREVENTING DRAG', {
              taskId: task.id,
              taskDuration,
              isFirstDay,
              isLastDay
            });
            e.preventDefault();
            e.stopPropagation();
            // Completely block any drag events
            e.nativeEvent.stopImmediatePropagation();
            // Force the resize to start
            handleResizeStart(e, 'right');
          }}
          onMouseEnter={(e) => {
            console.log('🖱️ RIGHT HANDLE MOUSE ENTER');
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseLeave={(e) => {
            console.log('🖱️ RIGHT HANDLE MOUSE LEAVE');
            e.preventDefault();
            e.stopPropagation();
          }}
          title="Drag to resize task duration (right edge)"
        />
      )}

      {/* Custom Tooltip */}
      <TaskTooltip
        task={task}
        isVisible={showTooltip && !isDragging && !isResizing && !activeResizeHandle}
        position={tooltipPosition}
      />
    </div>
  );
}