import { useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useTaskStore } from '../../stores/taskStore';
import { useTimerStore } from '../../stores/timerStore';

export default function TaskSelector() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { tasks, fetchTasks } = useTaskStore();
  const selectedTaskId = useTimerStore((s) => s.selectedTaskId);
  const setSelectedTaskId = useTimerStore((s) => s.setSelectedTaskId);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks(false);
    }
  }, [isAuthenticated, fetchTasks]);

  if (!isAuthenticated) return null;

  return (
    <div className="w-full max-w-xs">
      <select
        value={selectedTaskId || ''}
        onChange={(e) => setSelectedTaskId(e.target.value || null)}
        className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
      >
        <option value="">No task selected</option>
        {tasks.map((task) => (
          <option key={task.id} value={task.id}>
            {task.name}
          </option>
        ))}
      </select>
    </div>
  );
}
