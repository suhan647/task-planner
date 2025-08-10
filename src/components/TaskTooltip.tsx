import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Task } from '../types/Task';
import { formatDisplayDate } from '../utils/dateUtils';
import { getTaskColor } from '../utils/taskUtils';

interface TaskTooltipProps {
  task: Task;
  isVisible: boolean;
  position: { x: number; y: number };
}

export function TaskTooltip({ task, isVisible, position }: TaskTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const [isPositioned, setIsPositioned] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate initial position before rendering
  const initialPosition = useMemo(() => {
    if (!isVisible) return position;
    
    // Estimate tooltip dimensions for initial positioning
    const estimatedWidth = 280; // Approximate tooltip width
    const estimatedHeight = 160; // Approximate tooltip height
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let newX = position.x;
    let newY = position.y;
    
    // Adjust horizontal position if tooltip would go off-screen
    if (newX + estimatedWidth > viewportWidth - 20) {
      newX = position.x - estimatedWidth - 10;
    } else {
      newX = position.x + 10;
    }
    
    // Adjust vertical position if tooltip would go off-screen
    if (newY + estimatedHeight > viewportHeight - 20) {
      newY = position.y - estimatedHeight - 10;
    } else {
      newY = position.y + 10;
    }
    
    return { x: newX, y: newY };
  }, [isVisible, position]);

  // Set initial position when tooltip becomes visible
  useEffect(() => {
    if (isVisible && !isPositioned) {
      setAdjustedPosition(initialPosition);
      setIsPositioned(true);
    }
  }, [isVisible, isPositioned, initialPosition]);

  // Debounced position update for subsequent mouse movements
  const updatePosition = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (isVisible && tooltipRef.current && isPositioned) {
        const tooltip = tooltipRef.current;
        const rect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let newX = position.x;
        let newY = position.y;

        // Adjust horizontal position if tooltip would go off-screen
        if (newX + rect.width > viewportWidth - 20) {
          newX = position.x - rect.width - 10;
        } else {
          newX = position.x + 10;
        }

        // Adjust vertical position if tooltip would go off-screen
        if (newY + rect.height > viewportHeight - 20) {
          newY = position.y - rect.height - 10;
        } else {
          newY = position.y + 10;
        }

        // Only update if position changed significantly (prevents micro-adjustments)
        const currentPos = adjustedPosition;
        const deltaX = Math.abs(newX - currentPos.x);
        const deltaY = Math.abs(newY - currentPos.y);
        
        if (deltaX > 5 || deltaY > 5) {
          setAdjustedPosition({ x: newX, y: newY });
        }
      }
    }, 50); // 50ms debounce
  }, [isVisible, position, adjustedPosition, isPositioned]);

  useEffect(() => {
    if (isPositioned) {
      updatePosition();
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [updatePosition, isPositioned]);

  // Reset positioning when tooltip becomes invisible
  useEffect(() => {
    if (!isVisible) {
      setIsPositioned(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const duration = Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 bg-gray-900 text-white rounded-lg shadow-xl border border-gray-700 p-4 max-w-xs transition-none"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        transform: 'translate(0, 0)',
        pointerEvents: 'none',
      }}
    >
      {/* Tooltip arrow */}
      <div className="absolute w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900 -top-2 left-4" />
      
      <div className="space-y-3">
        {/* Task title and category */}
        <div>
          <h3 className="font-semibold text-white text-sm mb-1">{task.title}</h3>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getTaskColor(task.category)}`} />
            <span className="text-xs text-gray-300">{task.category}</span>
          </div>
        </div>

        {/* Task dates */}
        <div className="space-y-1">
          <div className="text-xs text-gray-400">Duration</div>
          <div className="text-xs text-white">
            <div>From: {formatDisplayDate(task.startDate)}</div>
            <div>To: {formatDisplayDate(task.endDate)}</div>
            <div className="font-medium mt-1">{duration} day{duration !== 1 ? 's' : ''}</div>
          </div>
        </div>

        {/* Created date */}
        <div className="text-xs text-gray-400">
          Created: {formatDisplayDate(task.createdAt)}
        </div>

        {/* Actions hint */}
        <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
          💡 Click to edit • Drag to move • Drag edges to resize
        </div>
      </div>
    </div>
  );
} 