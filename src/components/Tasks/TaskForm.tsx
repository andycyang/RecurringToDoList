import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTasks } from '../../context/TaskContext';
import { useToast } from '../../context/ToastContext';
import {
  Frequency,
  ScheduleType,
  AnchorPattern,
  FREQUENCY_LABELS,
  SCHEDULE_TYPE_LABELS,
  ANCHOR_PATTERN_LABELS,
} from '../../types';
import { getTodayString, encodeYearlyDate, decodeYearlyDate } from '../../utils/dateUtils';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { AddCategoryInline } from '../Categories/AddCategoryInline';

export function TaskForm() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { addTask, updateTask, getTaskById, categories } = useTasks();
  const { showToast } = useToast();

  const isEditing = Boolean(taskId);
  const existingTask = taskId ? getTaskById(taskId) : null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [customIntervalDays, setCustomIntervalDays] = useState('30');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('interval');
  const [anchorPattern, setAnchorPattern] = useState<AnchorPattern>('quarterly_end');
  const [anchorDay, setAnchorDay] = useState('1');
  const [anchorMonth, setAnchorMonth] = useState('0'); // 0-indexed for yearly_date
  const [categoryId, setCategoryId] = useState('');
  const [firstDueDate, setFirstDueDate] = useState(getTodayString());
  const [lastCompleted, setLastCompleted] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (existingTask) {
      setName(existingTask.name);
      setDescription(existingTask.description || '');
      setFrequency(existingTask.frequency);
      setCustomIntervalDays(String(existingTask.customIntervalDays || 30));
      setScheduleType(existingTask.scheduleType || 'interval');
      setAnchorPattern(existingTask.anchorPattern || 'quarterly_end');
      if (existingTask.anchorPattern === 'yearly_date' && existingTask.anchorDay) {
        const decoded = decodeYearlyDate(existingTask.anchorDay);
        setAnchorMonth(String(decoded.month));
        setAnchorDay(String(decoded.day));
      } else {
        setAnchorDay(String(existingTask.anchorDay || 1));
      }
      setCategoryId(existingTask.categoryId || '');
      setFirstDueDate(existingTask.firstDueDate);
      setLastCompleted(existingTask.lastCompleted || '');
    }
  }, [existingTask]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Task name is required';
    }

    if (scheduleType === 'interval' && !firstDueDate) {
      newErrors.firstDueDate = 'First due date is required';
    }

    if (scheduleType === 'interval' && frequency === 'custom') {
      const days = parseInt(customIntervalDays, 10);
      if (isNaN(days) || days < 1) {
        newErrors.customIntervalDays = 'Enter a valid number of days (1 or more)';
      }
    }

    if (scheduleType === 'calendar') {
      if (anchorPattern === 'monthly_day') {
        const day = parseInt(anchorDay, 10);
        if (isNaN(day) || day < 1 || day > 31) {
          newErrors.anchorDay = 'Enter a valid day (1-31)';
        }
      } else if (anchorPattern === 'yearly_date') {
        const day = parseInt(anchorDay, 10);
        const month = parseInt(anchorMonth, 10);
        if (isNaN(day) || day < 1 || day > 31) {
          newErrors.anchorDay = 'Enter a valid day (1-31)';
        }
        if (isNaN(month) || month < 0 || month > 11) {
          newErrors.anchorMonth = 'Select a month';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSaving(true);

    // Calculate anchor day for storage
    let computedAnchorDay: number | undefined;
    if (scheduleType === 'calendar') {
      if (anchorPattern === 'quarterly_end') {
        computedAnchorDay = undefined;
      } else if (anchorPattern === 'monthly_day') {
        computedAnchorDay = parseInt(anchorDay, 10);
      } else if (anchorPattern === 'yearly_date') {
        computedAnchorDay = encodeYearlyDate(parseInt(anchorMonth, 10), parseInt(anchorDay, 10));
      }
    }

    const taskData = {
      name: name.trim(),
      description: description.trim() || undefined,
      frequency,
      customIntervalDays: frequency === 'custom' ? parseInt(customIntervalDays, 10) : undefined,
      scheduleType,
      anchorPattern: scheduleType === 'calendar' ? anchorPattern : undefined,
      anchorDay: scheduleType === 'calendar' ? computedAnchorDay : undefined,
      categoryId: categoryId || undefined,
      firstDueDate,
      lastCompleted: lastCompleted || undefined,
    };

    try {
      if (isEditing && existingTask) {
        await updateTask({
          ...existingTask,
          ...taskData,
        });
        showToast('Task updated');
      } else {
        await addTask(taskData);
        showToast('Task created');
      }
      navigate(-1);
    } catch (error) {
      showToast('Failed to save task', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const frequencyOptions = Object.entries(FREQUENCY_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const scheduleTypeOptions = Object.entries(SCHEDULE_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const anchorPatternOptions = Object.entries(ANCHOR_PATTERN_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const monthOptions = [
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' },
  ];

  const categoryOptions = [
    { value: '', label: 'No category' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
    { value: '__add__', label: '+ Add new category...' },
  ];

  const handleCategoryChange = (value: string) => {
    if (value === '__add__') {
      setShowAddCategory(true);
    } else {
      setCategoryId(value);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Edit Task' : 'Add New Task'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Task Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Drain hot tub"
          error={errors.name}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any notes or instructions..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <Select
          label="Schedule Type"
          value={scheduleType}
          onChange={(e) => setScheduleType(e.target.value as ScheduleType)}
          options={scheduleTypeOptions}
        />
        <p className="text-sm text-gray-500 -mt-4">
          {scheduleType === 'interval'
            ? 'Next due date is calculated from when you complete the task.'
            : 'Task is always due on a fixed calendar date, regardless of completion.'}
        </p>

        {scheduleType === 'interval' && (
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as Frequency)}
              options={frequencyOptions}
            />

            {frequency === 'custom' && (
              <Input
                label="Interval (days)"
                type="number"
                min="1"
                value={customIntervalDays}
                onChange={(e) => setCustomIntervalDays(e.target.value)}
                error={errors.customIntervalDays}
              />
            )}
          </div>
        )}

        {scheduleType === 'calendar' && (
          <div className="space-y-4">
            <Select
              label="Recurrence Pattern"
              value={anchorPattern}
              onChange={(e) => setAnchorPattern(e.target.value as AnchorPattern)}
              options={anchorPatternOptions}
            />

            {anchorPattern === 'monthly_day' && (
              <Input
                label="Day of Month"
                type="number"
                min="1"
                max="31"
                value={anchorDay}
                onChange={(e) => setAnchorDay(e.target.value)}
                error={errors.anchorDay}
              />
            )}

            {anchorPattern === 'yearly_date' && (
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Month"
                  value={anchorMonth}
                  onChange={(e) => setAnchorMonth(e.target.value)}
                  options={monthOptions}
                  error={errors.anchorMonth}
                />
                <Input
                  label="Day"
                  type="number"
                  min="1"
                  max="31"
                  value={anchorDay}
                  onChange={(e) => setAnchorDay(e.target.value)}
                  error={errors.anchorDay}
                />
              </div>
            )}
          </div>
        )}

        {showAddCategory ? (
          <AddCategoryInline
            onAdd={(id) => {
              setCategoryId(id);
              setShowAddCategory(false);
            }}
            onCancel={() => setShowAddCategory(false)}
          />
        ) : (
          <Select
            label="Category"
            value={categoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            options={categoryOptions}
          />
        )}

        {scheduleType === 'interval' && (
          <Input
            label="First Due Date"
            type="date"
            value={firstDueDate}
            onChange={(e) => setFirstDueDate(e.target.value)}
            error={errors.firstDueDate}
            required
          />
        )}

        {scheduleType === 'interval' && !isEditing && (
          <Input
            label="Last Completed (optional)"
            type="date"
            value={lastCompleted}
            onChange={(e) => setLastCompleted(e.target.value)}
            max={getTodayString()}
          />
        )}
        {scheduleType === 'interval' && !isEditing && (
          <p className="text-sm text-gray-500 -mt-4">
            If you've already done this task recently, enter when. This will calculate the next due date.
          </p>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </div>
  );
}
