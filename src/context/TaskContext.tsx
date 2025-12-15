import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { Task, CompletionRecord, Category, AppData } from '../types';
import { loadAppData, saveAppData } from '../utils/storage';
import { calculateNextDue, getTodayString } from '../utils/dateUtils';

type Action =
  | { type: 'LOAD_DATA'; payload: AppData }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'COMPLETE_TASK'; payload: { taskId: string; completedAt: string; notes?: string } }
  | { type: 'UNDO_COMPLETION'; payload: { taskId: string; recordId: string } }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string };

interface TaskContextType {
  tasks: Task[];
  completionRecords: CompletionRecord[];
  categories: Category[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'nextDue'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  completeTask: (taskId: string, completedAt?: string, notes?: string) => CompletionRecord;
  undoCompletion: (taskId: string, recordId: string) => void;
  addCategory: (name: string, color: string) => void;
  deleteCategory: (categoryId: string) => void;
  getTaskById: (taskId: string) => Task | undefined;
  getCompletionsByTaskId: (taskId: string) => CompletionRecord[];
  getCategoryById: (categoryId: string) => Category | undefined;
}

const TaskContext = createContext<TaskContextType | null>(null);

function taskReducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'LOAD_DATA':
      return action.payload;

    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
        completionRecords: state.completionRecords.filter(
          (r) => r.taskId !== action.payload
        ),
      };

    case 'COMPLETE_TASK': {
      const { taskId, completedAt, notes } = action.payload;
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return state;

      const newRecord: CompletionRecord = {
        id: crypto.randomUUID(),
        taskId,
        completedAt,
        recordedAt: new Date().toISOString(),
        notes,
      };

      const nextDue = calculateNextDue(completedAt, task.frequency, task.customIntervalDays);

      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? { ...t, lastCompleted: completedAt, nextDue, updatedAt: new Date().toISOString() }
            : t
        ),
        completionRecords: [...state.completionRecords, newRecord],
      };
    }

    case 'UNDO_COMPLETION': {
      const { taskId, recordId } = action.payload;
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return state;

      const remainingRecords = state.completionRecords.filter(
        (r) => !(r.taskId === taskId && r.id === recordId)
      );

      const taskRecords = remainingRecords
        .filter((r) => r.taskId === taskId)
        .sort((a, b) => b.completedAt.localeCompare(a.completedAt));

      const mostRecentCompletion = taskRecords[0]?.completedAt;
      const nextDue = mostRecentCompletion
        ? calculateNextDue(mostRecentCompletion, task.frequency, task.customIntervalDays)
        : task.firstDueDate;

      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                lastCompleted: mostRecentCompletion,
                nextDue,
                updatedAt: new Date().toISOString(),
              }
            : t
        ),
        completionRecords: remainingRecords,
      };
    }

    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };

    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
        tasks: state.tasks.map((t) =>
          t.categoryId === action.payload ? { ...t, categoryId: undefined } : t
        ),
      };

    default:
      return state;
  }
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, {
    schemaVersion: 1,
    tasks: [],
    completionRecords: [],
    categories: [],
  });

  useEffect(() => {
    const data = loadAppData();
    dispatch({ type: 'LOAD_DATA', payload: data });
  }, []);

  useEffect(() => {
    if (state.categories.length > 0 || state.tasks.length > 0) {
      saveAppData(state);
    }
  }, [state]);

  const addTask = useCallback(
    (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'nextDue'>) => {
      const now = new Date().toISOString();
      const nextDue = taskData.lastCompleted
        ? calculateNextDue(taskData.lastCompleted, taskData.frequency, taskData.customIntervalDays)
        : taskData.firstDueDate;

      const task: Task = {
        ...taskData,
        id: crypto.randomUUID(),
        nextDue,
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: 'ADD_TASK', payload: task });
    },
    []
  );

  const updateTask = useCallback((task: Task) => {
    const nextDue = task.lastCompleted
      ? calculateNextDue(task.lastCompleted, task.frequency, task.customIntervalDays)
      : task.firstDueDate;

    dispatch({
      type: 'UPDATE_TASK',
      payload: { ...task, nextDue, updatedAt: new Date().toISOString() },
    });
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  }, []);

  const completeTask = useCallback(
    (taskId: string, completedAt?: string, notes?: string): CompletionRecord => {
      const dateUsed = completedAt || getTodayString();
      dispatch({
        type: 'COMPLETE_TASK',
        payload: { taskId, completedAt: dateUsed, notes },
      });

      return {
        id: crypto.randomUUID(),
        taskId,
        completedAt: dateUsed,
        recordedAt: new Date().toISOString(),
        notes,
      };
    },
    []
  );

  const undoCompletion = useCallback((taskId: string, recordId: string) => {
    dispatch({ type: 'UNDO_COMPLETION', payload: { taskId, recordId } });
  }, []);

  const addCategory = useCallback((name: string, color: string) => {
    const category: Category = {
      id: crypto.randomUUID(),
      name,
      color,
      isDefault: false,
    };
    dispatch({ type: 'ADD_CATEGORY', payload: category });
  }, []);

  const deleteCategory = useCallback((categoryId: string) => {
    dispatch({ type: 'DELETE_CATEGORY', payload: categoryId });
  }, []);

  const getTaskById = useCallback(
    (taskId: string) => state.tasks.find((t) => t.id === taskId),
    [state.tasks]
  );

  const getCompletionsByTaskId = useCallback(
    (taskId: string) =>
      state.completionRecords
        .filter((r) => r.taskId === taskId)
        .sort((a, b) => b.completedAt.localeCompare(a.completedAt)),
    [state.completionRecords]
  );

  const getCategoryById = useCallback(
    (categoryId: string) => state.categories.find((c) => c.id === categoryId),
    [state.categories]
  );

  return (
    <TaskContext.Provider
      value={{
        tasks: state.tasks,
        completionRecords: state.completionRecords,
        categories: state.categories,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
        undoCompletion,
        addCategory,
        deleteCategory,
        getTaskById,
        getCompletionsByTaskId,
        getCategoryById,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
