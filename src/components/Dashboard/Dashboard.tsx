import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTasks } from '../../context/TaskContext';
import { getTaskStatus, getDaysUntilDue } from '../../utils/dateUtils';
import { CategoryFilter } from '../Categories/CategoryFilter';
import { TaskSection } from './TaskSection';
import { EmptyState } from './EmptyState';
import { Button } from '../common/Button';

export function Dashboard() {
  const { tasks } = useTasks();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const filteredTasks = useMemo(() => {
    if (selectedCategoryId === null) return tasks;
    if (selectedCategoryId === 'uncategorized') {
      return tasks.filter((t) => !t.categoryId);
    }
    return tasks.filter((t) => t.categoryId === selectedCategoryId);
  }, [tasks, selectedCategoryId]);

  const { overdueTasks, dueSoonTasks, upcomingTasks } = useMemo(() => {
    const overdue: typeof tasks = [];
    const dueSoon: typeof tasks = [];
    const upcoming: typeof tasks = [];

    filteredTasks.forEach((task) => {
      const status = getTaskStatus(task.nextDue);
      if (status === 'overdue') overdue.push(task);
      else if (status === 'due-soon') dueSoon.push(task);
      else if (status === 'upcoming') upcoming.push(task);
    });

    // Sort overdue by most overdue first
    overdue.sort((a, b) => getDaysUntilDue(a.nextDue) - getDaysUntilDue(b.nextDue));
    // Sort others by soonest first
    dueSoon.sort((a, b) => getDaysUntilDue(a.nextDue) - getDaysUntilDue(b.nextDue));
    upcoming.sort((a, b) => getDaysUntilDue(a.nextDue) - getDaysUntilDue(b.nextDue));

    return { overdueTasks: overdue, dueSoonTasks: dueSoon, upcomingTasks: upcoming };
  }, [filteredTasks]);

  const hasVisibleTasks =
    overdueTasks.length > 0 || dueSoonTasks.length > 0 || upcomingTasks.length > 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link to="/tasks/new">
          <Button>
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Task
          </Button>
        </Link>
      </div>

      {tasks.length > 0 && (
        <div className="mb-6">
          <CategoryFilter
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />
        </div>
      )}

      {!hasVisibleTasks ? (
        <EmptyState
          hasAnyTasks={tasks.length > 0}
          filterActive={selectedCategoryId !== null}
        />
      ) : (
        <>
          <TaskSection
            title="Overdue"
            tasks={overdueTasks}
            status="overdue"
          />
          <TaskSection
            title="Due Soon"
            tasks={dueSoonTasks}
            status="due-soon"
          />
          <TaskSection
            title="Upcoming"
            tasks={upcomingTasks}
            status="upcoming"
          />
        </>
      )}

      {tasks.length > 0 && (
        <div className="mt-8 pt-6 border-t">
          <Link
            to="/tasks"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View all tasks →
          </Link>
        </div>
      )}
    </div>
  );
}
