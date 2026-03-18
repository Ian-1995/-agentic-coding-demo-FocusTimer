import { useEffect, useState } from 'react';
import { useTaskStore, type Task } from '../../stores/taskStore';
import { useAuthStore } from '../../stores/authStore';

function TaskItem({ task, onArchive, onDelete }: {
  task: Task;
  onArchive: (id: string, archived: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 px-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
      <span className="text-[var(--color-text)]">{task.name}</span>
      <div className="flex gap-2">
        <button
          onClick={() => onArchive(task.id, !task.is_archived)}
          className="text-xs px-2 py-1 rounded bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          {task.is_archived ? 'Unarchive' : 'Archive'}
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { tasks, isLoading, fetchTasks, createTask, updateTask, deleteTask } = useTaskStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [newTaskName, setNewTaskName] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks(showArchived);
    }
  }, [isAuthenticated, showArchived, fetchTasks]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    await createTask(newTaskName.trim());
    setNewTaskName('');
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center text-[var(--color-text-muted)] py-12">
        Please login to manage tasks.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Tasks</h2>
        <button
          onClick={() => setShowArchived(!showArchived)}
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          {showArchived ? 'Show Active' : 'Show Archived'}
        </button>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="text"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          placeholder="New task name..."
          className="flex-1 px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:opacity-90 transition-opacity"
        >
          Add
        </button>
      </form>

      {isLoading ? (
        <div className="text-center text-[var(--color-text-muted)] py-8">Loading...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center text-[var(--color-text-muted)] py-8">
          {showArchived ? 'No archived tasks.' : 'No tasks yet. Create one above!'}
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onArchive={(id, archived) => updateTask(id, { is_archived: archived })}
              onDelete={deleteTask}
            />
          ))}
        </div>
      )}
    </div>
  );
}
