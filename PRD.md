# Product Requirements Document: Recurring To-Do List App

## Overview

A web application for tracking recurring maintenance tasks with configurable frequencies. The app helps users stay on top of periodic tasks (home maintenance, vehicle care, health checkups, etc.) by showing what's due and upcoming.

## Problem Statement

Many important tasks need to be done on a recurring basis (annually, monthly, etc.) but are easy to forget. Existing to-do apps focus on one-time tasks and don't handle recurring schedules well. Users need a dedicated tool to track when recurring tasks were last completed and when they're next due.

## Target User

Individual users managing personal recurring tasks (homeowners, renters, vehicle owners, etc.)

## Core Features (Phase 1 MVP)

### 1. Dashboard (Home Page)
- Display tasks that are currently due or overdue
- Display upcoming tasks in sections:
  - **Overdue**: Past due date, sorted by how late
  - **Due Soon**: Next 7 days
  - **Upcoming**: 8-30 days out
- Visual distinction between overdue, due soon, and upcoming tasks
- Quick action to mark a task as completed
- Empty state with "Add your first task" CTA when no tasks exist
- Filter by category

### 2. Task Management
- Create new recurring tasks with:
  - Task name (required)
  - Description/notes (optional)
  - Frequency (required): daily, weekly, biweekly, monthly, quarterly, semiannually, annually, or custom interval in days
  - Category (optional)
  - First due date (required) - when should this task first be due?
  - Last completed date (optional) - for importing existing tasks
- Edit existing tasks
- Delete tasks (with confirmation dialog)
- View task details including completion history

### 3. Task Completion
- Mark a task as completed with option to:
  - Use current date (default)
  - Select a past date ("I did this yesterday") for accurate records
- Toast notification with "Undo" option for accidental completions
- Automatically calculates next due date based on frequency
- Completion history log for each task
- Multiple completions on the same day are allowed (each recorded separately, most recent drives next due date)

### 4. Categories
- Assign tasks to categories (e.g., Home, Yard, Vehicle, Health)
- Filter dashboard by category
- Default categories provided: Home, Yard, Vehicle, Health (these cannot be deleted)
- Add custom categories inline (name + color picker)
- Custom categories can be deleted; associated tasks become uncategorized (`categoryId` unset)
- "Uncategorized" is not a real category—it's simply tasks with no `categoryId`

## Recurrence Rules (MVP)

### Scheduling Model
MVP uses **interval-based scheduling** only:
- Next due date = completion date + frequency interval
- If completed early, next due shifts earlier
- If completed late, next due is calculated from actual completion date

### Frequency Definitions
| Frequency | Interval |
|-----------|----------|
| daily | 1 day |
| weekly | 7 days |
| biweekly | 14 days |
| monthly | 1 calendar month |
| quarterly | 3 calendar months |
| semiannually | 6 calendar months |
| annually | 1 calendar year |
| custom | User-specified days |

### Edge Cases
- **Monthly on 29th-31st**: Clamp to last day of month (e.g., Jan 31 + 1 month = Feb 28/29)
- **Never-completed tasks**: `nextDue` = `firstDueDate` (user-specified when creating task)
- **Importing with lastCompleted**: If user provides both `firstDueDate` and `lastCompleted`, then `nextDue` = `lastCompleted` + interval (firstDueDate is ignored once there's a completion)
- **Definition of "due"**: A task is due when `nextDue <= today` (date comparison, no time component)
- **Timezones**: All dates are date-only (YYYY-MM-DD), interpreted in user's local timezone
- **"Most recent" completion**: Determined by `completedAt` date (when work was done), not `recordedAt` timestamp
- **Undo completion**: Removes the completion record; `nextDue` recomputed from the previous most recent `completedAt`, or reverts to `firstDueDate` if no completions remain

## Secondary Features (Phase 2)

### 5. Advanced Scheduling
- Calendar-based scheduling (same date each year, e.g., "every January 15th")
- Schedule type field: `interval` vs `calendar`
- Anchor date for calendar-based tasks
- Configurable lookahead window (default 30 days)
- Configurable "due soon" threshold (default 7 days)

### 6. Task Enhancements
- Time estimate for each task
- Priority level (low, medium, high)
- Attachments or links (e.g., to product manuals)
- Seasonal tasks (only show during certain months)
- Snooze/postpone functionality

### 7. History & Reporting
- View all completion history across tasks
- Export data (CSV/JSON)
- Import data

### 8. Category Management
- Dedicated category management page
- Edit category names and colors
- Reorder categories

## Out of Scope (For Now)

- Push notifications / email reminders
- Multi-user / shared household support
- Mobile native apps (web-responsive only)
- Cloud sync / account system (local-first for v1)

## User Stories

1. As a user, I want to see all my overdue and upcoming tasks on one page so I know what needs attention.
2. As a user, I want to add a new recurring task with a specific frequency so the app tracks when it's due.
3. As a user, I want to mark a task as complete so the next due date is automatically calculated.
4. As a user, I want to choose a completion date when marking complete so I can backdate if I forgot to log it.
5. As a user, I want to undo an accidental completion so I don't mess up my schedule.
6. As a user, I want to see when I last completed a task so I have a maintenance record.
7. As a user, I want to organize tasks by category so I can focus on one area at a time.
8. As a user, I want to edit or delete tasks as my needs change.
9. As a user, I want to add custom categories to organize tasks my way.

## Success Metrics

- User can add, complete, edit, and delete recurring tasks
- Dashboard accurately shows overdue and upcoming tasks
- Data persists across browser sessions
- Completion history is maintained for each task

## Decisions Log

| Question | Decision | Rationale |
|----------|----------|-----------|
| Interval vs calendar-based scheduling? | Interval-based for MVP, calendar-based in Phase 2 | Simpler to implement, covers most use cases |
| What determines nextDue for new tasks? | User-specified `firstDueDate` field | Avoids ambiguity, user controls when tracking starts |
| Due date: timestamp or date-only? | Date-only (YYYY-MM-DD) | Avoids timezone/DST issues, simpler mental model |
| Monthly on 31st behavior? | Clamp to last day of month | More intuitive than overflow to next month |
| Allow backdating completions? | Yes, with date picker | Enables accurate maintenance records |
| Multiple completions same day? | Allowed, most recent drives nextDue | Handles mistakes and legitimate re-dos |
| Edit/delete in MVP? | Yes | Essential for usability |
| Custom categories in MVP? | Yes, inline add only | Full management page in Phase 2 |
