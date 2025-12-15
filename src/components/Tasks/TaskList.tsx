import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTasks } from '../../context/TaskContext';
import { getTaskStatus, getDaysUntilDue, formatDueText } from '../../utils/dateUtils';
import { FREQUENCY_LABELS } from '../../types';
import { CategoryBadge } from '../Categories/CategoryBadge';
import { CategoryFilter } from '../Categories/CategoryFilter';
import { Button } from '../common/Button';

export function TaskList() {
  const { tasks, getCategoryById } = useTasks();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'due' | 'name' | 'created'>('due');

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    if (selectedCategoryId === 'uncategorized') {
      filtered = tasks.filter((t) => !t.categoryId);
    } else if (selectedCategoryId) {
      filtered = tasks.filter((t) => t.categoryId === selectedCategoryId);
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'due':
          return getDaysUntilDue(a.nextDue) - getDaysUntilDue(b.nextDue);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return b.createdAt.localeCompare(a.createdAt);
        default:
          return 0;
      }
    });
  }, [tasks, selectedCategoryId, sortBy]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Tasks</h1>
        <Link to="/tasks/new">
          <Button>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </Button>
        </Link>
      </div>

      {tasks.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <CategoryFilter
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="due">Due Date</option>
              <option value="name">Name</option>
              <option value="created">Recently Added</option>
            </select>
          </div>
        </div>
      )}

      {filteredAndSortedTasks.length === 0 ? (
        <div className="text-center py-12">
          {tasks.length === 0 ? (
            <>
              <p className="text-gray-500 mb-4">No tasks yet.</p>
              <Link to="/tasks/new">
                <Button>Add Your First Task</Button>
              </Link>
            </>
          ) : (
            <p className="text-gray-500">No tasks match the selected filter.</p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frequency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedTasks.map((task) => {
                const category = task.categoryId ? getCategoryById(task.categoryId) : null;
                const status = getTaskStatus(task.nextDue);

                return (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        to={`/tasks/${task.id}`}
                        className="text-gray-900 font-medium hover:text-blue-600"
                      >
                        {task.name}
                      </Link>
                      {task.description && (
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {task.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {category ? (
                        <CategoryBadge name={category.name} color={category.color} />
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {FREQUENCY_LABELS[task.frequency]}
                      {task.frequency === 'custom' && ` (${task.customIntervalDays} days)`}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm font-medium ${
                          status === 'overdue'
                            ? 'text-red-600'
                            : status === 'due-soon'
                              ? 'text-amber-600'
                              : 'text-gray-600'
                        }`}
                      >
                        {formatDueText(task.nextDue)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
