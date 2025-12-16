export type Frequency =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'semiannually'
  | 'annually'
  | 'custom';

export type ScheduleType = 'interval' | 'calendar';

export type AnchorPattern = 'quarterly_end' | 'semiannual_end' | 'monthly_day' | 'yearly_date';

export interface Task {
  id: string;
  name: string;
  description?: string;
  frequency: Frequency;
  customIntervalDays?: number;
  scheduleType: ScheduleType;
  anchorPattern?: AnchorPattern;
  anchorDay?: number; // day of month (1-31) or encoded as MMDD for yearly
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

export const SCHEDULE_TYPE_LABELS: Record<ScheduleType, string> = {
  interval: 'From completion date',
  calendar: 'Fixed calendar date',
};

export const ANCHOR_PATTERN_LABELS: Record<AnchorPattern, string> = {
  quarterly_end: 'End of quarter',
  semiannual_end: 'End of half year',
  monthly_day: 'Day of month',
  yearly_date: 'Same date each year',
};
