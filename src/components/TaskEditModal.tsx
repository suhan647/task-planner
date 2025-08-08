import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Task, TaskCategory } from '../types/Task';
import { useTaskContext } from '../context/TaskContext';
import { formatDisplayDate } from '../utils/dateUtils';

interface TaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

const categories: TaskCategory[] = ['To Do', 'In Progress', 'Review', 'Completed'];

export function TaskEditModal({ isOpen, onClose, task }: TaskEditModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('To Do');
  const { dispatch } = useTaskContext();

  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title);
      setCategory(task.category);
    }
  }, [isOpen, task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const updatedTask: Task = {
      ...task,
      title: title.trim(),
      category,
    };

    dispatch({ type: 'UPDATE_TASK', task: updatedTask });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch({ type: 'DELETE_TASK', taskId: task.id });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Edit Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-2">
              Task Name
            </label>
            <input
              type="text"
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="edit-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Duration</h3>
            <div className="text-sm text-gray-600">
              <div>From: {formatDisplayDate(task.startDate)}</div>
              <div>To: {formatDisplayDate(task.endDate)}</div>
              <div className="mt-1 font-medium">
                Duration: {Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} day(s)
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Tip: Drag the task edges to adjust dates
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}