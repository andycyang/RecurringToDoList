import { Link } from 'react-router-dom';
import { Button } from '../common/Button';

interface EmptyStateProps {
  hasAnyTasks: boolean;
  filterActive: boolean;
}

export function EmptyState({ hasAnyTasks, filterActive }: EmptyStateProps) {
  if (filterActive) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No tasks in this category
        </h3>
        <p className="mt-2 text-gray-500">
          Try selecting a different category or view all tasks.
        </p>
      </div>
    );
  }

  if (!hasAnyTasks) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-16 w-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
        <h3 className="mt-4 text-xl font-medium text-gray-900">
          No recurring tasks yet
        </h3>
        <p className="mt-2 text-gray-500 max-w-sm mx-auto">
          Start tracking your recurring maintenance tasks. Add things like "Change HVAC filter" or "Clean gutters" to stay on top of home maintenance.
        </p>
        <div className="mt-6">
          <Link to="/tasks/new">
            <Button size="lg">Add Your First Task</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <svg
        className="mx-auto h-12 w-12 text-green-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 className="mt-4 text-lg font-medium text-gray-900">All caught up!</h3>
      <p className="mt-2 text-gray-500">
        No tasks due in the next 30 days. Great job staying on top of things!
      </p>
    </div>
  );
}
