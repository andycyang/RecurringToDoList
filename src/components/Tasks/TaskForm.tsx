import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTasks } from '../../context/TaskContext';
import { useToast } from '../../context/ToastContext';
import { Frequency, FREQUENCY_LABELS } from '../../types';
import { getTodayString } from '../../utils/dateUtils';
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
  const [categoryId, setCategoryId] = useState('');
  const [firstDueDate, setFirstDueDate] = useState(getTodayString());
  const [lastCompleted, setLastCompleted] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existingTask) {
      setName(existingTask.name);
      setDescription(existingTask.description || '');
      setFrequency(existingTask.frequency);
      setCustomIntervalDays(String(existingTask.customIntervalDays || 30));
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

    if (!firstDueDate) {
      newErrors.firstDueDate = 'First due date is required';
    }

    if (frequency === 'custom') {
      const days = parseInt(customIntervalDays, 10);
      if (isNaN(days) || days < 1) {
        newErrors.customIntervalDays = 'Enter a valid number of days (1 or more)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const taskData = {
      name: name.trim(),
      description: description.trim() || undefined,
      frequency,
      customIntervalDays: frequency === 'custom' ? parseInt(customIntervalDays, 10) : undefined,
      categoryId: categoryId || undefined,
      firstDueDate,
      lastCompleted: lastCompleted || undefined,
    };

    if (isEditing && existingTask) {
      updateTask({
        ...existingTask,
        ...taskData,
      });
      showToast('Task updated');
    } else {
      addTask(taskData);
      showToast('Task created');
    }

    navigate(-1);
  };

  const frequencyOptions = Object.entries(FREQUENCY_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

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

        <Input
          label="First Due Date"
          type="date"
          value={firstDueDate}
          onChange={(e) => setFirstDueDate(e.target.value)}
          error={errors.firstDueDate}
          required
        />

        {!isEditing && (
          <Input
            label="Last Completed (optional)"
            type="date"
            value={lastCompleted}
            onChange={(e) => setLastCompleted(e.target.value)}
            max={getTodayString()}
          />
        )}
        {!isEditing && (
          <p className="text-sm text-gray-500 -mt-4">
            If you've already done this task recently, enter when. This will calculate the next due date.
          </p>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </div>
  );
}
