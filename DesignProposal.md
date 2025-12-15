# Design Proposal: Recurring To-Do List App

## Tech Stack

### Frontend
**React 18 with TypeScript**
- Component-based architecture fits well with task cards, forms, and dashboard widgets
- Large ecosystem and community support
- TypeScript for type safety and better developer experience

**Routing: React Router v6**
- Standard routing solution for React SPAs
- Nested routes and layouts support

**Styling: Tailwind CSS**
- Utility-first CSS for rapid development
- Built-in responsive design utilities
- No need to write custom CSS for most components

**Build Tool: Vite**
- Fast development server with hot module replacement
- Optimized production builds
- First-class TypeScript support

### Data Persistence
**localStorage with JSON serialization**
- No backend server required
- Data stays on user's device (privacy-friendly)
- Simple to implement
- Limitation: Data doesn't sync across devices

**Serialization Strategy:**
- All dates stored as ISO 8601 date strings (YYYY-MM-DD)
- Single `loadFromStorage()` / `saveToStorage()` layer handles parsing/serialization
- Schema version stored for future migrations

### State Management
**React Context + useReducer**
- Built into React, no additional dependencies
- Sufficient for this app's complexity
- Consider memoization (React.memo, useMemo) if task list grows large
- Can migrate to Zustand if performance issues arise

### Date Handling
**date-fns**
- Lightweight date manipulation library
- Tree-shakeable (only import what you use)
- Use `addMonths`, `addYears` with `{ clampToEndOfMonth: true }` behavior for month-end handling

## Project Structure

```
src/
├── components/
│   ├── Dashboard/
│   │   ├── Dashboard.tsx
│   │   ├── TaskCard.tsx
│   │   ├── OverdueSection.tsx
│   │   ├── DueSoonSection.tsx
│   │   ├── UpcomingSection.tsx
│   │   └── EmptyState.tsx
│   ├── Tasks/
│   │   ├── TaskForm.tsx
│   │   ├── TaskList.tsx
│   │   └── TaskDetail.tsx
│   ├── Categories/
│   │   ├── CategoryFilter.tsx
│   │   ├── CategoryBadge.tsx
│   │   └── AddCategoryInline.tsx
│   └── common/
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── ConfirmDialog.tsx
│       ├── Toast.tsx
│       ├── DatePicker.tsx
│       └── Input.tsx
├── context/
│   ├── TaskContext.tsx
│   └── ToastContext.tsx
├── hooks/
│   ├── useTasks.ts
│   ├── useCategories.ts
│   └── useLocalStorage.ts
├── types/
│   └── index.ts
├── utils/
│   ├── dateUtils.ts
│   ├── taskUtils.ts
│   └── storage.ts
├── data/
│   └── defaultCategories.ts
├── App.tsx
└── main.tsx
```

## Data Model

```typescript
// All dates are stored as ISO date strings (YYYY-MM-DD) in localStorage
// and parsed to Date objects when loaded into state

interface Task {
  id: string;
  name: string;
  description?: string;
  frequency: Frequency;
  customIntervalDays?: number; // Required when frequency is 'custom'
  categoryId?: string;
  firstDueDate: string;        // YYYY-MM-DD - when task tracking starts
  lastCompleted?: string;      // YYYY-MM-DD - most recent completion
  nextDue: string;             // YYYY-MM-DD - derived but stored for convenience
  createdAt: string;           // ISO timestamp
  updatedAt: string;           // ISO timestamp
}

interface CompletionRecord {
  id: string;
  taskId: string;
  completedAt: string;         // YYYY-MM-DD - the date work was done
  recordedAt: string;          // ISO timestamp - when record was created
  notes?: string;
}

interface Category {
  id: string;
  name: string;
  color: string;               // Hex color code
  isDefault: boolean;          // Default categories (Home, Yard, Vehicle, Health) can't be deleted
}

// Note: "Uncategorized" is not a category record—it's simply tasks with categoryId unset/undefined

type Frequency =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'semiannually'
  | 'annually'
  | 'custom';

// localStorage schema
interface AppData {
  schemaVersion: number;       // Current: 1
  tasks: Task[];
  completionRecords: CompletionRecord[];
  categories: Category[];
}
```

### Data Model Notes

- **`nextDue` is stored, not derived**: For performance and simplicity. Recalculated only when:
  - Task is completed (nextDue = completionDate + interval)
  - Task frequency is edited
  - Completion is undone (revert to previous completedAt + interval, or firstDueDate if none)
- **Import rule**: If both `firstDueDate` and `lastCompleted` are provided, `nextDue` = `lastCompleted` + interval
- **Completion records are separate**: Easier to query history, clean deletion semantics
- **"Most recent" completion**: Determined by max `completedAt` (work date), not `recordedAt` (log timestamp)
- **Schema versioning**: `schemaVersion` field enables future migrations when adding fields
- **Date-only for due dates**: Avoids timezone/DST issues; timestamps only for audit fields
- **Corrupt storage handling**: Invalid JSON triggers backup to `{key}-corrupt-{timestamp}` and reset to defaults

## Key Components

### Dashboard
- Fetches all tasks, groups by due status
- Sections: Overdue (sorted by days late), Due Soon (next 7 days), Upcoming (8-30 days)
- Each task card shows: name, category badge, days until due/overdue, complete button
- Empty state component when no tasks exist
- Category filter dropdown

### Task Form
- Add/Edit mode (same component)
- Fields: name, description, frequency dropdown, custom days input (conditional), category dropdown, first due date picker
- For existing tasks being imported: optional "last completed" date picker
- Inline "Add category" option in category dropdown

### Task Detail View
- Full task information
- Completion history list (sorted newest first)
- Edit button → opens TaskForm in edit mode
- Delete button → ConfirmDialog → deletion

### Toast System
- Global toast context for notifications
- "Task completed" toast with Undo button (5 second timeout)
- Success/error toasts for other actions

## Pages / Routes

| Route | Component | Description | Phase |
|-------|-----------|-------------|-------|
| `/` | Dashboard | Home page with due/upcoming tasks | 1 |
| `/tasks` | TaskList | All tasks with filtering/sorting | 1 |
| `/tasks/new` | TaskForm | Create new task | 1 |
| `/tasks/:id` | TaskDetail | View task details + history | 1 |
| `/tasks/:id/edit` | TaskForm | Edit existing task | 1 |
| `/categories` | CategoryManager | Full category management | 2 |

## Implementation Phases

### Phase 1 (MVP)
1. Project setup (Vite + React + TypeScript + Tailwind + React Router)
2. Data model, types, and localStorage persistence layer with schema versioning
3. Task Context with useReducer (CRUD operations)
4. Dashboard with overdue/due soon/upcoming sections
5. Empty state component
6. Add new task form with all fields
7. Mark task as complete (with date picker option)
8. Toast system with undo for completions
9. Task detail view with completion history
10. Edit task functionality
11. Delete task with confirmation
12. Default categories + inline add category
13. Category filter on dashboard

### Phase 2
1. Category management page (edit, delete, reorder)
2. Advanced filtering and sorting on task list
3. Calendar-based scheduling option
4. Configurable dashboard settings (lookahead window, due soon threshold)
5. Data export (JSON/CSV)

### Phase 3
1. Data import
2. Dark mode
3. PWA support for offline use
4. Priority levels
5. Time estimates

## Date Calculation Logic

```typescript
// utils/dateUtils.ts
import { parseISO, format, addDays, addMonths, addYears, startOfDay, differenceInDays } from 'date-fns';

// Format as date-only string (YYYY-MM-DD)
function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function calculateNextDue(completionDate: string, frequency: Frequency, customDays?: number): string {
  const date = parseISO(completionDate);

  switch (frequency) {
    case 'daily':
      return toDateString(addDays(date, 1));
    case 'weekly':
      return toDateString(addDays(date, 7));
    case 'biweekly':
      return toDateString(addDays(date, 14));
    case 'monthly':
      return toDateString(addMonths(date, 1)); // date-fns clamps to end of month
    case 'quarterly':
      return toDateString(addMonths(date, 3));
    case 'semiannually':
      return toDateString(addMonths(date, 6));
    case 'annually':
      return toDateString(addYears(date, 1));
    case 'custom':
      return toDateString(addDays(date, customDays!));
  }
}

function getTaskStatus(nextDue: string): 'overdue' | 'due-soon' | 'upcoming' | 'future' {
  const today = startOfDay(new Date());
  const dueDate = parseISO(nextDue);
  const daysUntilDue = differenceInDays(dueDate, today);

  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 7) return 'due-soon';
  if (daysUntilDue <= 30) return 'upcoming';
  return 'future';
}
```

## Storage Layer

```typescript
// utils/storage.ts

const STORAGE_KEY = 'recurring-todo-app';
const CURRENT_SCHEMA_VERSION = 1;

function loadAppData(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return getDefaultAppData();
  }

  try {
    const data = JSON.parse(raw) as AppData;
    return migrateIfNeeded(data);
  } catch (e) {
    // Corrupt JSON - backup and reset
    console.error('Failed to parse stored data, resetting to defaults', e);
    localStorage.setItem(`${STORAGE_KEY}-corrupt-${Date.now()}`, raw);
    return getDefaultAppData();
  }
}

function saveAppData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function migrateIfNeeded(data: AppData): AppData {
  // Future migrations go here
  // if (data.schemaVersion < 2) { data = migrateV1toV2(data); }
  return data;
}

function getDefaultAppData(): AppData {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    tasks: [],
    completionRecords: [],
    categories: defaultCategories,
  };
}
```

## UX Considerations

### Accidental Action Prevention
- **Complete**: Toast with 5-second undo window
- **Delete**: Confirmation dialog required
- **Edit**: No confirmation (user initiated, can re-edit)

### Empty States
- Dashboard with no tasks: Friendly message + "Add your first task" button
- Category filter with no matches: "No tasks in this category"

### Loading States
- localStorage is synchronous, so no loading spinners needed
- Future API migration would need loading states

## Alternatives Considered

| Choice | Selected | Alternative | Reason |
|--------|----------|-------------|--------|
| Framework | React | Vue, Svelte | Largest ecosystem, most familiar |
| Routing | React Router | TanStack Router | Standard choice, simpler setup |
| Styling | Tailwind | CSS Modules, styled-components | Faster development, consistency |
| State | Context + useReducer | Redux, Zustand | Simpler for app size, no extra deps |
| Storage | localStorage | IndexedDB | Simpler API, sufficient for expected data size |
| Dates | date-fns | Day.js, Luxon | Lightweight, tree-shakeable, good month handling |
