import { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';

interface TaskSectionProps {
  title: string;
  tasks: Task[];
  status: TaskStatus;
  emptyMessage?: string;
}

export function TaskSection({ title, tasks, status, emptyMessage }: TaskSectionProps) {
  if (tasks.length === 0 && !emptyMessage) return null;

  const headerColors = {
    overdue: 'text-red-700',
    'due-soon': 'text-amber-700',
    upcoming: 'text-blue-700',
    future: 'text-gray-700',
  };

  return (
    <section className="mb-8">
      <h2 className={`text-lg font-semibold mb-4 ${headerColors[status]}`}>
        {title}
        {tasks.length > 0 && (
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({tasks.length})
          </span>
        )}
      </h2>
      {tasks.length === 0 ? (
        <p className="text-gray-500 text-sm">{emptyMessage}</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} status={status} />
          ))}
        </div>
      )}
    </section>
  );
}
