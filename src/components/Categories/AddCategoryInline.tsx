import { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface AddCategoryInlineProps {
  onAdd: (categoryId: string) => void;
  onCancel: () => void;
}

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export function AddCategoryInline({ onAdd, onCancel }: AddCategoryInlineProps) {
  const { addCategory, categories } = useTasks();
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const handleSubmit = () => {
    if (!name.trim()) return;

    addCategory(name.trim(), color);
    const newCategory = categories.find((c) => c.name === name.trim());
    if (newCategory) {
      onAdd(newCategory.id);
    }
    onCancel();
  };

  return (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
      <Input
        label="Category Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g., Garden"
        autoFocus
      />
      <div className="mt-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color
        </label>
        <div className="flex gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full transition-transform ${
                color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSubmit} disabled={!name.trim()}>
          Add Category
        </Button>
      </div>
    </div>
  );
}
