import { useTimerStore } from '../../stores/timerStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { formatTime, minutesToSeconds } from '../../utils/time';
import { PHASE_LABELS, PHASE_COLORS, type TimerPhase } from '../../utils/constants';

function getPhaseTotal(phase: TimerPhase, settings: { work_duration: number; short_break_duration: number; long_break_duration: number }): number {
  switch (phase) {
    case 'work': return minutesToSeconds(settings.work_duration);
    case 'shortBreak': return minutesToSeconds(settings.short_break_duration);
    case 'longBreak': return minutesToSeconds(settings.long_break_duration);
    default: return minutesToSeconds(settings.work_duration);
  }
}

export default function TimerDisplay() {
  const { timeRemaining, currentPhase, pomodoroCount } = useTimerStore();
  const settings = useSettingsStore();

  const total = getPhaseTotal(currentPhase === 'idle' ? 'work' : currentPhase, settings);
  const progress = currentPhase === 'idle' ? 0 : ((total - timeRemaining) / total) * 100;

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const color = PHASE_COLORS[currentPhase];

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Phase label */}
      <div
        className="text-lg font-medium tracking-wide uppercase"
        style={{ color }}
      >
        {PHASE_LABELS[currentPhase]}
      </div>

      {/* Circular timer */}
      <div className="relative w-72 h-72 flex items-center justify-center">
        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 280 280">
          {/* Background circle */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke="var(--color-surface)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        {/* Time display */}
        <div className="text-6xl font-mono font-bold tabular-nums">
          {formatTime(timeRemaining)}
        </div>
      </div>

      {/* Pomodoro count */}
      <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
        <span className="text-sm">Pomodoros completed:</span>
        <span className="text-xl font-bold" style={{ color: PHASE_COLORS.work }}>
          {pomodoroCount}
        </span>
      </div>
    </div>
  );
}
