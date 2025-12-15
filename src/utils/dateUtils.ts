import {
  parseISO,
  format,
  addDays,
  addMonths,
  addYears,
  startOfDay,
  differenceInDays,
} from 'date-fns';
import { Frequency, TaskStatus } from '../types';

export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function getTodayString(): string {
  return toDateString(new Date());
}

export function calculateNextDue(
  completionDate: string,
  frequency: Frequency,
  customDays?: number
): string {
  const date = parseISO(completionDate);

  switch (frequency) {
    case 'daily':
      return toDateString(addDays(date, 1));
    case 'weekly':
      return toDateString(addDays(date, 7));
    case 'biweekly':
      return toDateString(addDays(date, 14));
    case 'monthly':
      return toDateString(addMonths(date, 1));
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

export function getTaskStatus(nextDue: string): TaskStatus {
  const today = startOfDay(new Date());
  const dueDate = parseISO(nextDue);
  const daysUntilDue = differenceInDays(dueDate, today);

  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 7) return 'due-soon';
  if (daysUntilDue <= 30) return 'upcoming';
  return 'future';
}

export function getDaysUntilDue(nextDue: string): number {
  const today = startOfDay(new Date());
  const dueDate = parseISO(nextDue);
  return differenceInDays(dueDate, today);
}

export function formatDueText(nextDue: string): string {
  const days = getDaysUntilDue(nextDue);

  if (days < 0) {
    const absDays = Math.abs(days);
    return absDays === 1 ? '1 day overdue' : `${absDays} days overdue`;
  }
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `Due in ${days} days`;
}

export function formatDate(dateString: string): string {
  return format(parseISO(dateString), 'MMM d, yyyy');
}
