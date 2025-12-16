import {
  parseISO,
  format,
  addDays,
  addMonths,
  addYears,
  startOfDay,
  differenceInDays,
  endOfQuarter,
  setDate,
  setMonth,
  getDate,
  isAfter,
  isBefore,
  startOfToday,
} from 'date-fns';
import { Frequency, TaskStatus, ScheduleType, AnchorPattern } from '../types';

export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function getTodayString(): string {
  return toDateString(new Date());
}

// Interval-based: next due = completion date + interval
export function calculateIntervalNextDue(
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

// Calendar-based: next due = next occurrence of the pattern from today
export function calculateCalendarNextDue(
  anchorPattern: AnchorPattern,
  anchorDay?: number
): string {
  const today = startOfToday();

  switch (anchorPattern) {
    case 'quarterly_end': {
      // Find the next quarter end (Mar 31, Jun 30, Sep 30, Dec 31)
      const currentQuarterEnd = endOfQuarter(today);
      if (isAfter(currentQuarterEnd, today)) {
        return toDateString(currentQuarterEnd);
      }
      // Move to next quarter
      return toDateString(endOfQuarter(addMonths(today, 3)));
    }

    case 'monthly_day': {
      // Find the next occurrence of this day of month
      const day = anchorDay || 1;
      let nextDue = setDate(today, day);

      // If we're past this day in the current month, go to next month
      if (isBefore(nextDue, today) || toDateString(nextDue) === toDateString(today)) {
        nextDue = setDate(addMonths(today, 1), day);
      }

      // Handle months with fewer days (e.g., day 31 in February)
      const actualDay = getDate(nextDue);
      if (actualDay !== day) {
        // date-fns wraps to next month, so go back to last day of intended month
        nextDue = setDate(addMonths(today, 1), 0); // day 0 = last day of previous month
      }

      return toDateString(nextDue);
    }

    case 'yearly_date': {
      // anchorDay is encoded as MMDD (e.g., 101 = Jan 1, 1231 = Dec 31)
      const encoded = anchorDay || 101;
      const month = Math.floor(encoded / 100) - 1; // 0-indexed
      const day = encoded % 100;

      let nextDue = setMonth(setDate(today, day), month);

      // If we're past this date this year, go to next year
      if (isBefore(nextDue, today) || toDateString(nextDue) === toDateString(today)) {
        nextDue = setMonth(setDate(addYears(today, 1), day), month);
      }

      return toDateString(nextDue);
    }
  }
}

// Main function that handles both schedule types
export function calculateNextDue(
  completionDate: string,
  frequency: Frequency,
  scheduleType: ScheduleType,
  customDays?: number,
  anchorPattern?: AnchorPattern,
  anchorDay?: number
): string {
  if (scheduleType === 'calendar' && anchorPattern) {
    return calculateCalendarNextDue(anchorPattern, anchorDay);
  }
  return calculateIntervalNextDue(completionDate, frequency, customDays);
}

// For backward compatibility - used when schedule type is interval
export function calculateNextDueInterval(
  completionDate: string,
  frequency: Frequency,
  customDays?: number
): string {
  return calculateIntervalNextDue(completionDate, frequency, customDays);
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

// Helper to encode month and day for yearly_date anchor
export function encodeYearlyDate(month: number, day: number): number {
  return (month + 1) * 100 + day; // month is 0-indexed, so add 1
}

// Helper to decode yearly_date anchor
export function decodeYearlyDate(encoded: number): { month: number; day: number } {
  return {
    month: Math.floor(encoded / 100) - 1, // back to 0-indexed
    day: encoded % 100,
  };
}
