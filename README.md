# Recurring To-Do List

A web app for tracking recurring maintenance tasks with configurable frequencies. Never forget to drain your hot tub, change your HVAC filter, or clean out the gutters again.

![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-blue)

## Features

- **Dashboard** - See overdue, due soon (7 days), and upcoming (30 days) tasks at a glance
- **Flexible Scheduling** - Daily, weekly, biweekly, monthly, quarterly, semi-annually, annually, or custom intervals
- **Task Completion** - Mark tasks complete with today's date or backdate for accurate records
- **Undo Support** - 5-second undo window for accidental completions
- **Completion History** - Track when each task was completed over time
- **Categories** - Organize tasks by category (Home, Yard, Vehicle, Health, or custom)
- **Filtering** - Filter dashboard and task list by category
- **Local Storage** - Data persists in your browser with no account required

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/andycyang/RecurringToDoList.git
cd RecurringToDoList

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open http://localhost:5173 in your browser.

### Build for Production

```bash
npm run build
npm run preview  # Preview the production build
```

## Usage

1. **Add a task** - Click "Add Task" and enter the name, frequency, and first due date
2. **Complete a task** - Click "Complete" on any task card, or use the calendar icon to pick a specific date
3. **View details** - Click a task name to see its full details and completion history
4. **Filter by category** - Use the category pills on the dashboard to focus on specific areas

## Data Storage

All data is stored locally in your browser's localStorage. This means:
- No account or sign-up required
- Data stays on your device (privacy-friendly)
- Data does not sync across devices or browsers
- Clearing browser data will delete your tasks

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Vite** - Build tool
- **React Router 7** - Client-side routing
- **date-fns** - Date manipulation

## License

MIT
