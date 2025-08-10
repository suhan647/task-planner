# Task Planner App

A modern task planning application built with React, TypeScript, and Tailwind CSS.

## 🚀 How to Run the App

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation & Setup
```bash
# Clone the repository
git clone <repository-url>
cd task-planner

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

The app will open in your browser at `http://localhost:5173`

## 🧭 UI Navigation Guide

### Main Calendar View
- **Month Display**: Shows current month with day grid
- **Month Navigation**: Use left/right arrow buttons to navigate between months
- **Today Highlight**: Current date is highlighted with a blue circle
- **Day Grid**: Each day is represented as a clickable tile

### Task Management
- **Create Tasks**: Click and drag across multiple consecutive days, then fill the modal
- **Edit Tasks**: Click on any task bar to open the edit modal
- **Move Tasks**: Drag and drop task bars to different dates
- **Resize Tasks**: Drag the left/right edges of task bars to adjust duration
- **Delete Tasks**: Use the delete option in the edit modal

### Left Sidebar - Filters
- **Category Filters**: Checkboxes for filtering by task status
  - To Do (Blue)
  - In Progress (Yellow) 
  - Review (Purple)
  - Completed (Green)
- **Time Filters**: Single-select options for filtering by time range
  - Within 1 week
  - Within 2 weeks
  - Within 3 weeks
- **Task Statistics**: Overview showing count of tasks by category

### Task Categories & Colors
- **Blue**: To Do tasks (new tasks)
- **Yellow**: In Progress tasks (active work)
- **Purple**: Review tasks (under review)
- **Green**: Completed tasks (finished)

### Interactive Features
- **Drag & Drop**: Move tasks between dates
- **Resize Handles**: Visual handles on task edges for resizing
- **Tooltips**: Hover over tasks to see detailed information
- **Responsive Design**: Works on desktop and tablet devices

### Data Persistence
- All tasks are automatically saved to localStorage
- Changes persist between browser sessions
- Sample data is loaded on first visit

## 🎯 Quick Start Tips
1. Start by creating a few tasks using drag selection
2. Use the sidebar filters to organize your view
3. Navigate between months to plan ahead
4. Drag tasks to reschedule them as needed
5. Resize tasks to adjust their duration 