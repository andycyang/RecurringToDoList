export type Frequency =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'semiannually'
  | 'annually'
  | 'custom';

export interface Task {
  id: string;
  name: string;
  description?: string;
  frequency: Frequency;
  customIntervalDays?: number;
  categoryId?: string;
  firstDueDate: string;
  lastCompleted?: string;
  nextDue: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompletionRecord {
  id: string;
  taskId: string;
  completedAt: string;
  recordedAt: string;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
}

export interface AppData {
  schemaVersion: number;
  tasks: Task[];
  completionRecords: CompletionRecord[];
  categories: Category[];
}

export type TaskStatus = 'overdue' | 'due-soon' | 'upcoming' | 'future';

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Every 2 weeks',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semiannually: 'Every 6 months',
  annually: 'Annually',
  custom: 'Custom',
};
