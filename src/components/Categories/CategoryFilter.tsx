import { useTasks } from '../../context/TaskContext';

interface CategoryFilterProps {
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryFilter({
  selectedCategoryId,
  onSelectCategory,
}: CategoryFilterProps) {
  const { categories } = useTasks();

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelectCategory(null)}
        className={`
          px-3 py-1.5 rounded-full text-sm font-medium transition-colors
          ${
            selectedCategoryId === null
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
        `}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`
            px-3 py-1.5 rounded-full text-sm font-medium transition-colors
            ${
              selectedCategoryId === category.id
                ? 'text-white'
                : 'text-gray-700 hover:opacity-80'
            }
          `}
          style={{
            backgroundColor:
              selectedCategoryId === category.id ? category.color : `${category.color}20`,
            color: selectedCategoryId === category.id ? 'white' : category.color,
          }}
        >
          {category.name}
        </button>
      ))}
      <button
        onClick={() => onSelectCategory('uncategorized')}
        className={`
          px-3 py-1.5 rounded-full text-sm font-medium transition-colors
          ${
            selectedCategoryId === 'uncategorized'
              ? 'bg-gray-500 text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }
        `}
      >
        Uncategorized
      </button>
    </div>
  );
}
