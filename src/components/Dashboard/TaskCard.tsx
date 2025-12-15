import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Task, TaskStatus } from '../../types';
import { useTasks } from '../../context/TaskContext';
import { useToast } from '../../context/ToastContext';
import { formatDueText, getTodayString } from '../../utils/dateUtils';
import { CategoryBadge } from '../Categories/CategoryBadge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';

interface TaskCardProps {
  task: Task;
  status: TaskStatus;
}

export function TaskCard({ task, status }: TaskCardProps) {
  const { completeTask, undoCompletion, getCategoryById } = useTasks();
  const { showToast } = useToast();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [completionDate, setCompletionDate] = useState(getTodayString());

  const category = task.categoryId ? getCategoryById(task.categoryId) : null;

  const statusColors = {
    overdue: 'border-l-red-500 bg-red-50',
    'due-soon': 'border-l-amber-500 bg-amber-50',
    upcoming: 'border-l-blue-500 bg-blue-50',
    future: 'border-l-gray-300 bg-white',
  };

  const handleQuickComplete = () => {
    const record = completeTask(task.id);
    showToast('Task completed!', 'success', () => {
      undoCompletion(task.id, record.id);
    });
  };

  const handleDateComplete = () => {
    const record = completeTask(task.id, completionDate);
    setShowDatePicker(false);
    setCompletionDate(getTodayString());
    showToast('Task completed!', 'success', () => {
      undoCompletion(task.id, record.id);
    });
  };

  return (
    <>
      <div
        className={`
          border-l-4 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow
          ${statusColors[status]}
        `}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Link
              to={`/tasks/${task.id}`}
              className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
            >
              {task.name}
            </Link>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              {category && (
                <CategoryBadge name={category.name} color={category.color} />
              )}
              <span
                className={`text-sm ${
                  status === 'overdue' ? 'text-red-600 font-medium' : 'text-gray-500'
                }`}
              >
                {formatDueText(task.nextDue)}
              </span>
            </div>
            {task.description && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDatePicker(true)}
              title="Complete with custom date"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </Button>
            <Button size="sm" onClick={handleQuickComplete}>
              Complete
            </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        title="Complete Task"
      >
        <p className="text-gray-600 mb-4">
          When did you complete "{task.name}"?
        </p>
        <Input
          type="date"
          value={completionDate}
          onChange={(e) => setCompletionDate(e.target.value)}
          max={getTodayString()}
        />
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowDatePicker(false)}>
            Cancel
          </Button>
          <Button onClick={handleDateComplete}>Mark Complete</Button>
        </div>
      </Modal>
    </>
  );
}
