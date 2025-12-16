import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { Task, CompletionRecord, Category } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { calculateNextDue, getTodayString } from '../utils/dateUtils';

interface TaskContextType {
  tasks: Task[];
  completionRecords: CompletionRecord[];
  categories: Category[];
  loading: boolean;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'nextDue'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  completeTask: (taskId: string, completedAt?: string, notes?: string) => Promise<CompletionRecord>;
  undoCompletion: (taskId: string, recordId: string) => Promise<void>;
  addCategory: (name: string, color: string) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  getTaskById: (taskId: string) => Task | undefined;
  getCompletionsByTaskId: (taskId: string) => CompletionRecord[];
  getCategoryById: (categoryId: string) => Category | undefined;
}

const TaskContext = createContext<TaskContextType | null>(null);

// Convert database row to app types (snake_case to camelCase)
function dbToTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string | undefined,
    frequency: row.frequency as Task['frequency'],
    customIntervalDays: row.custom_interval_days as number | undefined,
    scheduleType: (row.schedule_type as Task['scheduleType']) || 'interval',
    anchorPattern: row.anchor_pattern as Task['anchorPattern'] | undefined,
    anchorDay: row.anchor_day as number | undefined,
    categoryId: row.category_id as string | undefined,
    firstDueDate: row.first_due_date as string,
    lastCompleted: row.last_completed as string | undefined,
    nextDue: row.next_due as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function dbToCompletionRecord(row: Record<string, unknown>): CompletionRecord {
  return {
    id: row.id as string,
    taskId: row.task_id as string,
    completedAt: row.completed_at as string,
    recordedAt: row.recorded_at as string,
    notes: row.notes as string | undefined,
  };
}

function dbToCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    name: row.name as string,
    color: row.color as string,
    isDefault: row.is_default as boolean,
  };
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completionRecords, setCompletionRecords] = useState<CompletionRecord[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data when user changes
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setCompletionRecords([]);
      setCategories([]);
      setLoading(false);
      return;
    }

    async function loadData() {
      setLoading(true);

      const [tasksRes, completionsRes, categoriesRes] = await Promise.all([
        supabase.from('tasks').select('*').order('next_due'),
        supabase.from('completion_records').select('*').order('completed_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
      ]);

      if (tasksRes.data) setTasks(tasksRes.data.map(dbToTask));
      if (completionsRes.data) setCompletionRecords(completionsRes.data.map(dbToCompletionRecord));
      if (categoriesRes.data) setCategories(categoriesRes.data.map(dbToCategory));

      setLoading(false);
    }

    loadData();
  }, [user]);

  const addTask = useCallback(
    async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'nextDue'>) => {
      if (!user) return;

      const nextDue = taskData.lastCompleted
        ? calculateNextDue(
            taskData.lastCompleted,
            taskData.frequency,
            taskData.scheduleType,
            taskData.customIntervalDays,
            taskData.anchorPattern,
            taskData.anchorDay
          )
        : taskData.scheduleType === 'calendar' && taskData.anchorPattern
          ? calculateNextDue(
              getTodayString(),
              taskData.frequency,
              taskData.scheduleType,
              taskData.customIntervalDays,
              taskData.anchorPattern,
              taskData.anchorDay
            )
          : taskData.firstDueDate;

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          name: taskData.name,
          description: taskData.description || null,
          frequency: taskData.frequency,
          custom_interval_days: taskData.customIntervalDays || null,
          schedule_type: taskData.scheduleType,
          anchor_pattern: taskData.anchorPattern || null,
          anchor_day: taskData.anchorDay || null,
          category_id: taskData.categoryId || null,
          first_due_date: taskData.firstDueDate,
          last_completed: taskData.lastCompleted || null,
          next_due: nextDue,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) setTasks((prev) => [...prev, dbToTask(data)]);
    },
    [user]
  );

  const updateTask = useCallback(
    async (task: Task) => {
      if (!user) return;

      const nextDue = task.lastCompleted
        ? calculateNextDue(
            task.lastCompleted,
            task.frequency,
            task.scheduleType,
            task.customIntervalDays,
            task.anchorPattern,
            task.anchorDay
          )
        : task.scheduleType === 'calendar' && task.anchorPattern
          ? calculateNextDue(
              getTodayString(),
              task.frequency,
              task.scheduleType,
              task.customIntervalDays,
              task.anchorPattern,
              task.anchorDay
            )
          : task.firstDueDate;

      const { data, error } = await supabase
        .from('tasks')
        .update({
          name: task.name,
          description: task.description || null,
          frequency: task.frequency,
          custom_interval_days: task.customIntervalDays || null,
          schedule_type: task.scheduleType,
          anchor_pattern: task.anchorPattern || null,
          anchor_day: task.anchorDay || null,
          category_id: task.categoryId || null,
          first_due_date: task.firstDueDate,
          last_completed: task.lastCompleted || null,
          next_due: nextDue,
          updated_at: new Date().toISOString(),
        })
        .eq('id', task.id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? dbToTask(data) : t)));
      }
    },
    [user]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!user) return;

      const { error } = await supabase.from('tasks').delete().eq('id', taskId);

      if (error) throw error;
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setCompletionRecords((prev) => prev.filter((r) => r.taskId !== taskId));
    },
    [user]
  );

  const completeTask = useCallback(
    async (taskId: string, completedAt?: string, notes?: string): Promise<CompletionRecord> => {
      if (!user) throw new Error('Not authenticated');

      const task = tasks.find((t) => t.id === taskId);
      if (!task) throw new Error('Task not found');

      const dateUsed = completedAt || getTodayString();
      const nextDue = calculateNextDue(
        dateUsed,
        task.frequency,
        task.scheduleType,
        task.customIntervalDays,
        task.anchorPattern,
        task.anchorDay
      );

      // Insert completion record
      const { data: recordData, error: recordError } = await supabase
        .from('completion_records')
        .insert({
          user_id: user.id,
          task_id: taskId,
          completed_at: dateUsed,
          notes: notes || null,
        })
        .select()
        .single();

      if (recordError) throw recordError;

      // Update task
      const { error: taskError } = await supabase
        .from('tasks')
        .update({
          last_completed: dateUsed,
          next_due: nextDue,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (taskError) throw taskError;

      const newRecord = dbToCompletionRecord(recordData);
      setCompletionRecords((prev) => [newRecord, ...prev]);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, lastCompleted: dateUsed, nextDue, updatedAt: new Date().toISOString() } : t
        )
      );

      return newRecord;
    },
    [user, tasks]
  );

  const undoCompletion = useCallback(
    async (taskId: string, recordId: string) => {
      if (!user) return;

      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      // Delete the completion record
      const { error: deleteError } = await supabase
        .from('completion_records')
        .delete()
        .eq('id', recordId);

      if (deleteError) throw deleteError;

      // Find the new most recent completion
      const remainingRecords = completionRecords.filter(
        (r) => !(r.taskId === taskId && r.id === recordId)
      );
      const taskRecords = remainingRecords
        .filter((r) => r.taskId === taskId)
        .sort((a, b) => b.completedAt.localeCompare(a.completedAt));

      const mostRecentCompletion = taskRecords[0]?.completedAt;
      const nextDue = mostRecentCompletion
        ? calculateNextDue(
            mostRecentCompletion,
            task.frequency,
            task.scheduleType,
            task.customIntervalDays,
            task.anchorPattern,
            task.anchorDay
          )
        : task.scheduleType === 'calendar' && task.anchorPattern
          ? calculateNextDue(
              getTodayString(),
              task.frequency,
              task.scheduleType,
              task.customIntervalDays,
              task.anchorPattern,
              task.anchorDay
            )
          : task.firstDueDate;

      // Update task
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          last_completed: mostRecentCompletion || null,
          next_due: nextDue,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (updateError) throw updateError;

      setCompletionRecords(remainingRecords);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, lastCompleted: mostRecentCompletion, nextDue, updatedAt: new Date().toISOString() }
            : t
        )
      );
    },
    [user, tasks, completionRecords]
  );

  const addCategory = useCallback(
    async (name: string, color: string) => {
      if (!user) return;

      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name,
          color,
          is_default: false,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) setCategories((prev) => [...prev, dbToCategory(data)]);
    },
    [user]
  );

  const deleteCategory = useCallback(
    async (categoryId: string) => {
      if (!user) return;

      // First update tasks to remove this category
      await supabase
        .from('tasks')
        .update({ category_id: null })
        .eq('category_id', categoryId);

      // Then delete the category
      const { error } = await supabase.from('categories').delete().eq('id', categoryId);

      if (error) throw error;

      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      setTasks((prev) =>
        prev.map((t) => (t.categoryId === categoryId ? { ...t, categoryId: undefined } : t))
      );
    },
    [user]
  );

  const getTaskById = useCallback(
    (taskId: string) => tasks.find((t) => t.id === taskId),
    [tasks]
  );

  const getCompletionsByTaskId = useCallback(
    (taskId: string) =>
      completionRecords
        .filter((r) => r.taskId === taskId)
        .sort((a, b) => b.completedAt.localeCompare(a.completedAt)),
    [completionRecords]
  );

  const getCategoryById = useCallback(
    (categoryId: string) => categories.find((c) => c.id === categoryId),
    [categories]
  );

  return (
    <TaskContext.Provider
      value={{
        tasks,
        completionRecords,
        categories,
        loading,
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
