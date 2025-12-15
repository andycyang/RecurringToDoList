import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTasks } from '../../context/TaskContext';
import { useToast } from '../../context/ToastContext';
import { FREQUENCY_LABELS } from '../../types';
import { formatDate, formatDueText, getTaskStatus, getTodayString } from '../../utils/dateUtils';
import { CategoryBadge } from '../Categories/CategoryBadge';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';

export function TaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { getTaskById, getCompletionsByTaskId, getCategoryById, completeTask, undoCompletion, deleteTask } = useTasks();
  const { showToast } = useToast();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [completionDate, setCompletionDate] = useState(getTodayString());
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const task = taskId ? getTaskById(taskId) : null;
  const completions = taskId ? getCompletionsByTaskId(taskId) : [];
  const category = task?.categoryId ? getCategoryById(task.categoryId) : null;

  if (!task) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Task Not Found</h1>
        <p className="text-gray-500 mb-6">This task may have been deleted.</p>
        <Link to="/">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const status = getTaskStatus(task.nextDue);

  const handleQuickComplete = async () => {
    setIsCompleting(true);
    try {
      const record = await completeTask(task.id);
      showToast('Task completed!', 'success', () => {
        undoCompletion(task.id, record.id);
      });
    } catch (error) {
      showToast('Failed to complete task', 'error');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDateComplete = async () => {
    setIsCompleting(true);
    try {
      const record = await completeTask(task.id, completionDate);
      setShowDatePicker(false);
      setCompletionDate(getTodayString());
      showToast('Task completed!', 'success', () => {
        undoCompletion(task.id, record.id);
      });
    } catch (error) {
      showToast('Failed to complete task', 'error');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTask(task.id);
      showToast('Task deleted');
      navigate('/');
    } catch (error) {
      showToast('Failed to delete task', 'error');
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{task.name}</h1>
            <div className="mt-2 flex items-center gap-3">
              {category && (
                <CategoryBadge name={category.name} color={category.color} />
              )}
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
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowDatePicker(true)} disabled={isCompleting}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </Button>
            <Button size="sm" onClick={handleQuickComplete} disabled={isCompleting}>
              {isCompleting ? 'Saving...' : 'Complete'}
            </Button>
          </div>
        </div>

        {task.description && (
          <p className="text-gray-600 mb-4">{task.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Frequency:</span>
            <span className="ml-2 text-gray-900">
              {FREQUENCY_LABELS[task.frequency]}
              {task.frequency === 'custom' && ` (${task.customIntervalDays} days)`}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Next Due:</span>
            <span className="ml-2 text-gray-900">{formatDate(task.nextDue)}</span>
          </div>
          {task.lastCompleted && (
            <div>
              <span className="text-gray-500">Last Completed:</span>
              <span className="ml-2 text-gray-900">{formatDate(task.lastCompleted)}</span>
            </div>
          )}
          <div>
            <span className="text-gray-500">Created:</span>
            <span className="ml-2 text-gray-900">{formatDate(task.createdAt.split('T')[0])}</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t flex gap-3">
          <Link to={`/tasks/${task.id}/edit`}>
            <Button variant="secondary">Edit Task</Button>
          </Link>
          <Button variant="danger" onClick={() => setShowDeleteConfirm(true)} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Task'}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Completion History
          {completions.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({completions.length} {completions.length === 1 ? 'time' : 'times'})
            </span>
          )}
        </h2>

        {completions.length === 0 ? (
          <p className="text-gray-500 text-sm">No completions recorded yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {completions.map((record) => (
              <li key={record.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="text-gray-900">{formatDate(record.completedAt)}</span>
                  {record.notes && (
                    <p className="text-sm text-gray-500 mt-1">{record.notes}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  Logged {formatDate(record.recordedAt.split('T')[0])}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.name}"? This will also delete all completion history. This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />

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
          <Button onClick={handleDateComplete} disabled={isCompleting}>
            {isCompleting ? 'Saving...' : 'Mark Complete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
