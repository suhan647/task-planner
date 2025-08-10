import React, { useState, useEffect, useCallback } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragStartEvent,
  closestCenter,
  rectIntersection,
} from '@dnd-kit/core';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarDay } from './CalendarDay';
import { TaskModal } from './TaskModal';
import { TaskEditModal } from './TaskEditModal';
import { useTaskContext } from '../context/TaskContext';
import { getMonthDates, isTaskInTimeFrame, getDaysBetween } from '../utils/dateUtils';
import { Task, CalendarDate } from '../types/Task';
import { saveTasksToStorage } from '../utils/taskUtils';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalDates, setModalDates] = useState<{ startDate: Date; endDate: Date } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<Date | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Date | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isResizingSelection, setIsResizingSelection] = useState(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [currentDropTarget, setCurrentDropTarget] = useState<Date | null>(null);
  const [dropTargetTimeout, setDropTargetTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  
  const { state, dispatch } = useTaskContext();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    console.log('Saving tasks to localStorage:', state.tasks);
    // Add a small delay to ensure the save operation completes
    setTimeout(() => {
      saveTasksToStorage(state.tasks);
    }, 0);
  }, [state.tasks]);

  // Handle global mouse events for selection
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSelecting && selectionStart && selectionEnd && !isDragging) {
        const startDate = selectionStart <= selectionEnd ? selectionStart : selectionEnd;
        const endDate = selectionStart <= selectionEnd ? selectionEnd : selectionStart;
        
        // Show modal for any selection (single day or multiple days)
        setModalDates({ startDate, endDate });
        setShowModal(true);
      }
      setIsSelecting(false);
      setSelectionStart(null);
      setSelectionEnd(null);
    };

    if (isSelecting) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isSelecting, selectionStart, selectionEnd, isDragging]);

  // Track cursor position during drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setCursorPosition({ x: e.clientX, y: e.clientY });
        
        // Clear any existing timeout
        if (dropTargetTimeout) {
          clearTimeout(dropTargetTimeout);
        }
        
        // Find which day cell the cursor is currently over
        const dayElements = document.querySelectorAll('[data-day]');
        let foundTarget = false;
        let closestTarget: Date | null = null;
        let closestDistance = Infinity;
        
        for (const dayElement of dayElements) {
          const rect = dayElement.getBoundingClientRect();
          const dayId = dayElement.getAttribute('data-day');
          
          if (dayId) {
            const targetDate = new Date(dayId);
            // Allow drops on any visible date in the calendar (including previous month dates)
            // The calendar shows dates from the previous month to fill the first week
            const monthDates = getMonthDates(currentDate);
            const calendarStartDate = monthDates[0].date;
            const calendarEndDate = monthDates[monthDates.length - 1].date;
            
            if (targetDate >= calendarStartDate && targetDate <= calendarEndDate) {
              // Check if cursor is directly over this cell
              if (e.clientX >= rect.left && e.clientX <= rect.right && 
                  e.clientY >= rect.top && e.clientY <= rect.bottom) {
                setCurrentDropTarget(targetDate);
                console.log('Current drop target (direct):', dayId);
                foundTarget = true;
                break;
              } else {
                // Calculate distance to center of this cell for fallback
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const distance = Math.sqrt(
                  Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
                );
                
                if (distance < closestDistance) {
                  closestDistance = distance;
                  closestTarget = targetDate;
                }
              }
            }
          }
        }
        
        // If we didn't find a direct target but have a closest target, use it
        if (!foundTarget && closestTarget && closestDistance < 100) { // 100px threshold
          setCurrentDropTarget(closestTarget);
          console.log('Current drop target (closest):', closestTarget);
        } else if (!foundTarget) {
          // Set a timeout to clear the target only if we're far from any cell
          const timeout = setTimeout(() => {
            setCurrentDropTarget(null);
            console.log('Clearing drop target after timeout');
          }, 100); // 100ms delay
          setDropTargetTimeout(timeout);
        }
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        if (dropTargetTimeout) {
          clearTimeout(dropTargetTimeout);
        }
      };
    } else {
      // Clear drop target when not dragging
      setCurrentDropTarget(null);
      if (dropTargetTimeout) {
        clearTimeout(dropTargetTimeout);
      }
    }
  }, [isDragging, currentDate, currentDropTarget, dropTargetTimeout]);

  const monthDates = getMonthDates(currentDate);
  const calendarStartDate = monthDates[0].date;
  // Use a day width that fills the full day cell
  const dayWidth = 140; // Adjusted to fill the full day cell width

  // Filter tasks based on current filters
  const filteredTasks = state.tasks.filter(task => {
    // Category filter
    if (state.filters.categories.length > 0 && !state.filters.categories.includes(task.category)) {
      return false;
    }
    
    // Time frame filter
    if (state.filters.timeFrame && !isTaskInTimeFrame(task.startDate, task.endDate, state.filters.timeFrame)) {
      return false;
    }
    
    return true;
  });

  const handleSelectionStart = useCallback((date: Date) => {
    console.log('Selection start - isDragging:', isDragging);
    if (isDragging) return; // Prevent selection when dragging tasks
    setIsSelecting(true);
    setSelectionStart(date);
    setSelectionEnd(date);
  }, [isDragging]);

  const handleSelectionUpdate = useCallback((date: Date) => {
    if (isSelecting && !isDragging) {
      setSelectionEnd(date);
    }
  }, [isSelecting, isDragging]);

  const handleSelectionEnd = useCallback(() => {
    if (isSelecting && selectionStart && selectionEnd && !isDragging) {
      const startDate = selectionStart <= selectionEnd ? selectionStart : selectionEnd;
      const endDate = selectionStart <= selectionEnd ? selectionEnd : selectionStart;
      setModalDates({ startDate, endDate });
      setShowModal(true);
    }
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  }, [isSelecting, selectionStart, selectionEnd, isDragging]);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setShowEditModal(false);
    setEditingTask(null);
    setModalDates(null);
  }, []);

  const handleTaskEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setShowEditModal(true);
  }, []);

  const handleTaskResize = useCallback((task: Task, newStartDate: Date, newEndDate: Date) => {
    const updatedTask: Task = {
      ...task,
      startDate: newStartDate,
      endDate: newEndDate,
    };
    dispatch({ type: 'UPDATE_TASK', task: updatedTask });
  }, [dispatch]);

  const isDateInSelection = useCallback((date: Date) => {
    if (!isSelecting || !selectionStart || !selectionEnd) return false;
    
    const start = selectionStart <= selectionEnd ? selectionStart : selectionEnd;
    const end = selectionStart <= selectionEnd ? selectionEnd : selectionStart;
    
    return date >= start && date <= end;
  }, [isSelecting, selectionStart, selectionEnd]);

  // Callback to reset all dragging states
  const resetAllDraggingStates = useCallback(() => {
    setIsDragging(false);
    dispatch({ type: 'SET_DRAGGED_TASK', task: null });
    // Force a re-render to ensure all CalendarDay components reset their isDraggingTask state
    setTimeout(() => {
      setIsDragging(false);
    }, 0);
  }, [dispatch]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !active.data.current?.task) {
      setIsDragging(false);
      setCurrentDropTarget(null);
      return;
    }
    
    const task = active.data.current.task as Task;
    
    // Use the current drop target that we've been tracking during the drag
    let targetDate: Date | null = currentDropTarget;
    
    console.log('Current drop target:', currentDropTarget);
    console.log('Over ID:', over.id);
    
    // If we don't have a current drop target, try to get it from over.id as fallback
    if (!targetDate && over.id) {
      try {
        targetDate = new Date(over.id as string);
        console.log('Using fallback target date:', over.id);
      } catch (error) {
        console.error('Invalid date from over.id:', over.id);
        setIsDragging(false);
        setCurrentDropTarget(null);
        return;
      }
    }
    
    // If we still don't have a target date, try to find the closest valid target
    if (!targetDate) {
      const dayElements = document.querySelectorAll('[data-day]');
      let closestTarget: Date | null = null;
      let closestDistance = Infinity;
      
      for (const dayElement of dayElements) {
        const rect = dayElement.getBoundingClientRect();
        const dayId = dayElement.getAttribute('data-day');
        
        if (dayId) {
          const candidateDate = new Date(dayId);
          const monthDates = getMonthDates(currentDate);
          const calendarStartDate = monthDates[0].date;
          const calendarEndDate = monthDates[monthDates.length - 1].date;
          
          if (candidateDate >= calendarStartDate && candidateDate <= calendarEndDate) {
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const distance = Math.sqrt(
              Math.pow(cursorPosition.x - centerX, 2) + Math.pow(cursorPosition.y - centerY, 2)
            );
            
            if (distance < closestDistance) {
              closestDistance = distance;
              closestTarget = candidateDate;
            }
          }
        }
      }
      
      if (closestTarget && closestDistance < 200) { // 200px threshold for final fallback
        targetDate = closestTarget;
        console.log('Using closest target as final fallback:', closestTarget);
      }
    }
    
    // If we still don't have a target date, abort
    if (!targetDate) {
      console.error('No valid target date found');
      setIsDragging(false);
      setCurrentDropTarget(null);
      return;
    }
    
    // Validate that the target date is within the visible calendar range
    const monthDates = getMonthDates(currentDate);
    const calendarStartDate = monthDates[0].date;
    const calendarEndDate = monthDates[monthDates.length - 1].date;
    
    if (targetDate < calendarStartDate || targetDate > calendarEndDate) {
      console.error('Target date is outside visible calendar range:', targetDate);
      setIsDragging(false);
      setCurrentDropTarget(null);
      return;
    }
    
    console.log('Final target date:', targetDate);
    
    // Calculate the duration of the task
    const taskDays = getDaysBetween(task.startDate, task.endDate);
    const taskDuration = taskDays.length;
    
    console.log('Task duration:', taskDuration);
    
    // Update task with new dates
    const updatedTask: Task = {
      ...task,
      startDate: targetDate,
      endDate: new Date(targetDate.getTime() + (taskDuration - 1) * 24 * 60 * 60 * 1000),
    };
    
    dispatch({ type: 'UPDATE_TASK', task: updatedTask });
    dispatch({ type: 'SET_DRAGGED_TASK', task: null });
    
    // Reset all dragging states to ensure selection works properly
    resetAllDraggingStates();
    setCurrentDropTarget(null);
  }, [dispatch, resetAllDraggingStates, currentDate, currentDropTarget, cursorPosition]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    
    if (active.data.current?.task) {
      const task = active.data.current.task as Task;
      dispatch({ type: 'SET_DRAGGED_TASK', task });
      setIsDragging(true);
    }
  }, [dispatch]);

  const handleDragOver = useCallback((event: any) => {
    if (isDragging && event.over) {
      const overId = event.over.id;
      if (overId) {
        try {
          const targetDate = new Date(overId as string);
          // Allow drops on any visible date in the calendar (including previous month dates)
          const monthDates = getMonthDates(currentDate);
          const calendarStartDate = monthDates[0].date;
          const calendarEndDate = monthDates[monthDates.length - 1].date;
          
          if (targetDate >= calendarStartDate && targetDate <= calendarEndDate) {
            setCurrentDropTarget(targetDate);
            console.log('Drag over target:', overId);
          }
        } catch (error) {
          console.error('Invalid date from over.id:', overId);
        }
      }
    }
  }, [isDragging, currentDate]);

  // Manual reset function for dragging state
  const resetDraggingState = useCallback(() => {
    setIsDragging(false);
    dispatch({ type: 'SET_DRAGGED_TASK', task: null });
  }, [dispatch]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  }, []);
  return (
    <div 
      className="flex-1 flex flex-col bg-white"
      onClick={() => {
        // Reset dragging state if clicking on empty space
        if (isDragging) {
          resetDraggingState();
        }
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {format(currentDate, 'MMMM yyyy')}
          </h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
          {state.filters.categories.length > 0 && ' (filtered)'}
        </div>
      </div>

      <DndContext 
        sensors={sensors} 
        onDragEnd={handleDragEnd} 
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        collisionDetection={closestCenter}
      >
        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-full">
            {/* Days of week header */}
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
              {DAYS_OF_WEEK.map(day => (
                <div
                  key={day}
                  className="px-4 py-3 text-sm font-medium text-gray-700 text-center border-r border-gray-200 last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 relative">
              {monthDates.map(date => (
                <CalendarDay
                  key={date.date.toISOString()}
                  date={date}
                  tasks={filteredTasks}
                  onSelectionStart={handleSelectionStart}
                  onSelectionUpdate={handleSelectionUpdate}
                  isInSelection={isDateInSelection(date.date)}
                  isSelecting={isSelecting}
                  selectionStart={selectionStart}
                  selectionEnd={selectionEnd}
                  calendarStartDate={calendarStartDate}
                  dayWidth={dayWidth}
                  onTaskEdit={handleTaskEdit}
                  onTaskResize={handleTaskResize}
                  isDragging={isDragging}
                  currentDropTarget={currentDropTarget}
                />
              ))}
              
              {/* Selection overlay */}
              {isSelecting && selectionStart && selectionEnd && (
                <SelectionOverlay
                  selectionStart={selectionStart}
                  selectionEnd={selectionEnd}
                  monthDates={monthDates}
                  dayWidth={dayWidth}
                />
              )}
            </div>
          </div>
          
          {/* Visual guide for task creation */}
          {!state.tasks.length && showWelcomeBanner && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-gray-500 z-10">
              <div className="bg-white bg-opacity-90 rounded-lg p-6 shadow-lg border border-gray-200 relative">
                {/* Close button */}
                <button
                  onClick={() => setShowWelcomeBanner(false)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Close welcome message"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <div className="text-2xl mb-2">📅</div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Welcome to Task Planner!</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Drag across multiple days to create your first task
                </p>
                <div className="text-xs text-gray-500">
                  💡 Tip: Use the filters on the left to organize your tasks
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Custom Drag Overlay that follows cursor exactly */}
        {isDragging && state.draggedTask && (
          <div
            className="fixed pointer-events-none z-50"
            style={{
              left: cursorPosition.x - 30,
              top: cursorPosition.y - 15,
            }}
          >
            <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium shadow-lg border border-blue-600">
              {state.draggedTask.title}
            </div>
          </div>
        )}
      </DndContext>

      {/* Task Creation Modal */}
      {showModal && modalDates && (
        <TaskModal
          isOpen={showModal}
          onClose={handleModalClose}
          startDate={modalDates.startDate}
          endDate={modalDates.endDate}
        />
      )}

      {/* Task Edit Modal */}
      {showEditModal && editingTask && (
        <TaskEditModal
          isOpen={showEditModal}
          onClose={handleModalClose}
          task={editingTask}
        />
      )}
    </div>
  );
}

interface SelectionOverlayProps {
  selectionStart: Date;
  selectionEnd: Date;
  monthDates: CalendarDate[];
  dayWidth: number;
}

function SelectionOverlay({ selectionStart, selectionEnd, monthDates, dayWidth }: SelectionOverlayProps) {
  const startDate = selectionStart <= selectionEnd ? selectionStart : selectionEnd;
  const endDate = selectionStart <= selectionEnd ? selectionEnd : selectionStart;
  
  // Find the grid positions
  const startIndex = monthDates.findIndex(d => 
    d.date.toDateString() === startDate.toDateString()
  );
  const endIndex = monthDates.findIndex(d => 
    d.date.toDateString() === endDate.toDateString()
  );
  
  if (startIndex === -1 || endIndex === -1) return null;
  
  const startRow = Math.floor(startIndex / 7);
  const endRow = Math.floor(endIndex / 7);
  const startCol = startIndex % 7;
  const endCol = endIndex % 7;
  
  const overlays = [];
  
  for (let row = startRow; row <= endRow; row++) {
    const isFirstRow = row === startRow;
    const isLastRow = row === endRow;
    
    const colStart = isFirstRow ? startCol : 0;
    const colEnd = isLastRow ? endCol : 6;
    
    const left = colStart * (100 / 7);
    const width = ((colEnd - colStart + 1) * (100 / 7));
    
    overlays.push(
      <div
        key={row}
        className="absolute pointer-events-none"
        style={{
          left: `${left}%`,
          width: `${width}%`,
          top: `${row * 112 + 32}px`, // Position in the task area (below the date number)
          height: '28px', // Height of task area
          zIndex: 15,
        }}
      >
        {/* Selection bar that looks like a task bar */}
        <div className="w-full h-full bg-blue-500 bg-opacity-80 rounded-md border-2 border-blue-600 shadow-sm flex items-center justify-center">
          <span className="text-white text-xs font-medium">
            {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} day{Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1 !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    );
  }
  
  return <>{overlays}</>;
}