import React, { useState, useEffect, useCallback } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarDay } from './CalendarDay';
import { TaskModal } from './TaskModal';
import { TaskEditModal } from './TaskEditModal';
import { useTaskContext } from '../context/TaskContext';
import { getMonthDates, isDateInTimeFrame } from '../utils/dateUtils';
import { Task } from '../types/Task';
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
    saveTasksToStorage(state.tasks);
  }, [state.tasks]);

  // Handle global mouse events for selection
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSelecting && selectionStart && selectionEnd) {
        const startDate = selectionStart <= selectionEnd ? selectionStart : selectionEnd;
        const endDate = selectionStart <= selectionEnd ? selectionEnd : selectionStart;
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
  }, [isSelecting, selectionStart, selectionEnd]);
  const monthDates = getMonthDates(currentDate);
  const calendarStartDate = monthDates[0].date;
  const dayWidth = 120; // Fixed day width for consistent task bar sizing

  // Filter tasks based on current filters
  const filteredTasks = state.tasks.filter(task => {
    // Category filter
    if (state.filters.categories.length > 0 && !state.filters.categories.includes(task.category)) {
      return false;
    }
    
    // Time frame filter
    if (state.filters.timeFrame && !isDateInTimeFrame(task.startDate, state.filters.timeFrame)) {
      return false;
    }
    
    return true;
  });

  const handleSelectionStart = useCallback((date: Date) => {
    setIsSelecting(true);
    setSelectionStart(date);
    setSelectionEnd(date);
  }, []);

  const handleSelectionUpdate = useCallback((date: Date) => {
    if (isSelecting) {
      setSelectionEnd(date);
    }
  }, [isSelecting]);

  const handleSelectionEnd = useCallback(() => {
    if (isSelecting && selectionStart && selectionEnd) {
      const startDate = selectionStart <= selectionEnd ? selectionStart : selectionEnd;
      const endDate = selectionStart <= selectionEnd ? selectionEnd : selectionStart;
      setModalDates({ startDate, endDate });
      setShowModal(true);
    }
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  }, [isSelecting, selectionStart, selectionEnd]);

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
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !active.data.current?.task) return;
    
    const task = active.data.current.task as Task;
    const targetDate = new Date(over.id as string);
    
    // Calculate the duration of the task
    const duration = task.endDate.getTime() - task.startDate.getTime();
    
    // Update task with new dates
    const updatedTask: Task = {
      ...task,
      startDate: targetDate,
      endDate: new Date(targetDate.getTime() + duration),
    };
    
    dispatch({ type: 'UPDATE_TASK', task: updatedTask });
  }, [dispatch]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  }, []);
  return (
    <div className="flex-1 flex flex-col bg-white">
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

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
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
            <div className="grid grid-cols-7">
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
                />
              ))}
            </div>
          </div>
          
          {/* Selection overlay */}
          {isSelecting && selectionStart && selectionEnd && (
            <div className="absolute inset-0 pointer-events-none z-20">
              <SelectionOverlay
                selectionStart={selectionStart}
                selectionEnd={selectionEnd}
                monthDates={monthDates}
                dayWidth={dayWidth}
              />
            </div>
          )}
        </div>

        <DragOverlay>
          {state.draggedTask && (
            <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium shadow-lg">
              {state.draggedTask.title}
            </div>
          )}
        </DragOverlay>
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
    const top = row * 112 + 40; // 112px row height + 40px header
    
    overlays.push(
      <div
        key={row}
        className="absolute bg-blue-500 bg-opacity-30 border-2 border-blue-500 rounded-md"
        style={{
          left: `${left}%`,
          width: `${width}%`,
          top: `${top}px`,
          height: '112px',
          zIndex: 10,
        }}
      />
    );
  }
  
  return <>{overlays}</>;
}