# Task Planner - Month View Calendar Application

A modern, interactive task planning application built with React, TypeScript, and Tailwind CSS. This application provides a Google Calendar-like experience focused on productivity task scheduling with drag & drop functionality.

## 🚀 Features

### ✅ Core Features (All Implemented)

#### 1. **Task Creation (via drag selection)**
- ✅ Drag across consecutive calendar days to create tasks
- ✅ Modal appears with task name input and category selection
- ✅ Tasks are displayed as colored bars spanning selected days
- ✅ Visual feedback during selection process

#### 2. **Task Editing & Management**
- ✅ **Drag & Drop Move**: Move entire tasks to different dates while preserving duration
- ✅ **Stretch to Resize**: Drag left/right edges to adjust start/end dates
- ✅ **Click to Edit**: Open edit modal to modify task name and category
- ✅ **Delete Tasks**: Remove tasks with confirmation dialog
- ✅ Live visual feedback during all operations

#### 3. **Task Categories**
- ✅ **To Do** (Blue) - New tasks
- ✅ **In Progress** (Yellow) - Active tasks
- ✅ **Review** (Purple) - Tasks under review
- ✅ **Completed** (Green) - Finished tasks
- ✅ Category selection modal on creation/editing
- ✅ Color-coded task bars for easy identification

#### 4. **Filtering System (Left Sidebar)**
- ✅ **Category Filters**: Multi-select checkboxes for filtering by task status
- ✅ **Time-Based Filters**: Single-select options for:
  - Tasks within 1 week
  - Tasks within 2 weeks
  - Tasks within 3 weeks
- ✅ **Cumulative Filtering**: Combine category and time filters
- ✅ **Live Updates**: Task list updates immediately as filters change
- ✅ **Task Statistics**: Overview of tasks by category

#### 5. **Calendar UI**
- ✅ **Month View**: Fixed month display with proper day labeling
- ✅ **Grid Layout**: Each day is a distinct tile/grid cell
- ✅ **Today Highlighting**: Current date is highlighted with blue circle
- ✅ **Month Navigation**: Navigate between months with arrow buttons
- ✅ **Responsive Design**: Clean, modern interface

### ✅ Optional Bonus Features (All Implemented)

#### 6. **Enhanced User Experience**
- ✅ **Month Navigation**: Navigate between months with prev/next buttons
- ✅ **Persistent Storage**: Tasks saved to localStorage automatically
- ✅ **Custom Tooltips**: Rich tooltips on task hover showing:
  - Task title and category
  - Start/end dates and duration
  - Creation date
  - Action hints (click to edit, drag to move, etc.)
- ✅ **Visual Guides**: Welcome message for new users
- ✅ **Sample Data**: Demo tasks loaded on first visit

#### 7. **Advanced Interactions**
- ✅ **Smart Selection**: Only show creation modal for multi-day selections
- ✅ **Resize Handles**: Visual handles on task edges for resizing
- ✅ **Drag Feedback**: Visual feedback during drag operations
- ✅ **Keyboard Support**: Accessibility features for drag operations

## 🛠️ Technical Implementation

### **Tech Stack**
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Drag & Drop**: @dnd-kit/core
- **Date Utilities**: date-fns
- **Icons**: Lucide React
- **Build Tool**: Vite

### **Architecture**
- **State Management**: React Context + useReducer
- **Component Structure**: Modular, reusable components
- **Data Persistence**: localStorage with automatic sync
- **Type Safety**: Full TypeScript implementation

### **Key Components**
- `Calendar.tsx` - Main calendar grid and drag & drop logic
- `CalendarDay.tsx` - Individual day cells with task rendering
- `TaskBar.tsx` - Task bars with resize and drag functionality
- `TaskModal.tsx` - Task creation modal
- `TaskEditModal.tsx` - Task editing modal
- `Sidebar.tsx` - Filtering panel
- `TaskTooltip.tsx` - Custom tooltip component
- `TaskContext.tsx` - Global state management

## 🎯 How to Use

### **Creating Tasks**
1. **Drag Selection**: Click and drag across multiple consecutive days
2. **Fill Modal**: Enter task name and select category
3. **Create**: Click "Create Task" to add the task

### **Editing Tasks**
1. **Click Task**: Click any task bar to open edit modal
2. **Modify**: Change title, category, or delete task
3. **Save**: Click "Save Changes" to update

### **Moving Tasks**
1. **Drag Task**: Click and drag any task bar to move it
2. **Drop**: Release on target date (duration preserved)

### **Resizing Tasks**
1. **Hover Edges**: Hover over left/right edges of task bars
2. **Drag Handles**: Drag resize handles to adjust start/end dates
3. **Visual Feedback**: See live updates as you resize

### **Filtering Tasks**
1. **Category Filter**: Check/uncheck categories in left sidebar
2. **Time Filter**: Select time-based filter options
3. **Combined**: Use both filters together for precise filtering

### **Navigation**
1. **Month Navigation**: Use arrow buttons to navigate months
2. **Today Highlight**: Current date is always highlighted
3. **Persistent State**: All changes are automatically saved

## 🚀 Getting Started

### **Prerequisites**
- Node.js 16+ 
- npm or yarn

### **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd task-planner

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### **Development**
```bash
# Start development server
npm run dev

# Run linting
npm run lint

# Preview production build
npm run preview
```

## 📱 Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🎨 Design Features
- **Clean UI**: Minimalist design with focus on usability
- **Responsive**: Works on desktop and tablet devices
- **Accessibility**: Keyboard navigation and screen reader support
- **Visual Feedback**: Hover states, transitions, and animations
- **Color Coding**: Intuitive color system for task categories

## 🔧 Customization
The application is highly customizable through:
- **Tailwind CSS**: Easy styling modifications
- **TypeScript**: Type-safe customizations
- **Component Architecture**: Modular design for easy extensions
- **Context API**: Centralized state management

## 📊 Performance
- **Optimized Rendering**: Efficient React component updates
- **Lazy Loading**: Components load as needed
- **Minimal Re-renders**: Optimized state management
- **Fast Interactions**: Smooth drag & drop operations

## 🐛 Known Issues
None currently identified. The application has been thoroughly tested for:
- Drag & drop functionality
- Task creation and editing
- Filtering system
- Data persistence
- Cross-browser compatibility

## 🤝 Contributing
This is a complete implementation of the Frontend Assignment Brief. All required features have been implemented and tested. The codebase is well-structured and documented for easy maintenance and future enhancements.

## 📄 License
This project is created as part of a frontend assignment and demonstrates modern React development practices with TypeScript and Tailwind CSS. 