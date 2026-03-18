import { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import api from '../../services/api';

interface Summary {
  total_sessions: number;
  total_minutes: number;
  total_hours: number;
  avg_sessions_per_day: number;
  avg_minutes_per_day: number;
  active_days: number;
}

interface ByTaskItem {
  task_id: string | null;
  task_name: string;
  total_sessions: number;
  total_minutes: number;
}

interface DailyItem {
  date: string;
  sessions: number;
  minutes: number;
}

export default function StatsPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [byTask, setByTask] = useState<ByTaskItem[]>([]);
  const [daily, setDaily] = useState<DailyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('7d');

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchStats = async () => {
      setLoading(true);
      const params: Record<string, string> = {};
      if (period !== 'all') {
        const days = period === '7d' ? 7 : 30;
        const from = new Date();
        from.setDate(from.getDate() - days);
        params.from = from.toISOString();
      }

      try {
        const [summaryRes, byTaskRes, dailyRes] = await Promise.all([
          api.get('/stats/summary', { params }),
          api.get('/stats/by-task', { params }),
          api.get('/stats/daily', { params }),
        ]);
        setSummary(summaryRes.data.data);
        setByTask(byTaskRes.data.data.by_task);
        setDaily(dailyRes.data.data.daily);
      } catch {
        // Silently handle errors
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, period]);

  if (!isAuthenticated) {
    return (
      <div className="text-center text-[var(--color-text-muted)] py-12">
        Please login to view stats.
      </div>
    );
  }

  if (loading) {
    return <div className="text-center text-[var(--color-text-muted)] py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Statistics</h2>
        <div className="flex gap-1">
          {(['7d', '30d', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {p === 'all' ? 'All' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Sessions" value={summary.total_sessions} />
          <StatCard label="Total Hours" value={summary.total_hours} />
          <StatCard label="Active Days" value={summary.active_days} />
          <StatCard label="Avg/Day" value={`${summary.avg_sessions_per_day} sessions`} />
        </div>
      )}

      {/* By Task */}
      {byTask.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[var(--color-text-muted)] mb-3">By Task</h3>
          <div className="space-y-2">
            {byTask.map((item) => {
              const maxMinutes = Math.max(...byTask.map((b) => b.total_minutes));
              const width = maxMinutes > 0 ? (item.total_minutes / maxMinutes) * 100 : 0;
              return (
                <div key={item.task_id || 'none'} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text)]">{item.task_name}</span>
                    <span className="text-[var(--color-text-muted)]">
                      {item.total_sessions} sessions / {item.total_minutes}min
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-primary)] rounded-full transition-all"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Daily Activity */}
      {daily.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[var(--color-text-muted)] mb-3">Daily Activity</h3>
          <div className="flex items-end gap-1 h-32">
            {daily.slice(-14).map((d) => {
              const maxSessions = Math.max(...daily.slice(-14).map((dd) => dd.sessions));
              const height = maxSessions > 0 ? (d.sessions / maxSessions) * 100 : 0;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-[var(--color-primary)] rounded-t opacity-80 hover:opacity-100 transition-opacity"
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${d.date}: ${d.sessions} sessions, ${d.minutes}min`}
                  />
                  <span className="text-[8px] text-[var(--color-text-muted)] truncate w-full text-center">
                    {d.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!summary?.total_sessions && (
        <div className="text-center text-[var(--color-text-muted)] py-8">
          No sessions recorded yet. Start a focus session!
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4">
      <div className="text-2xl font-bold text-[var(--color-text)]">{value}</div>
      <div className="text-xs text-[var(--color-text-muted)] mt-1">{label}</div>
    </div>
  );
}
