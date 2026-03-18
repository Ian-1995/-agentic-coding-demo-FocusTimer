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
  const { timeRemaining, currentPhase, pomodoroCount, isRunning } = useTimerStore();
  const settings = useSettingsStore();

  const activePhase = currentPhase === 'idle' ? 'work' : currentPhase;
  const total = getPhaseTotal(activePhase, settings);
  const progress = currentPhase === 'idle' ? 0 : ((total - timeRemaining) / total) * 100;

  const radius = 110;
  const strokeWidth = 5;
  const viewBox = (radius + strokeWidth) * 2;
  const center = viewBox / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const color = PHASE_COLORS[currentPhase];

  // Pomodoro dots (show up to long_break_interval)
  const interval = settings.long_break_interval;
  const completedInCycle = pomodoroCount % interval;

  return (
    <div className="flex flex-col items-center">
      {/* Circular timer */}
      <div className="relative flex items-center justify-center" style={{ width: viewBox, height: viewBox }}>
        <svg className="absolute w-full h-full -rotate-90" viewBox={`0 0 ${viewBox} ${viewBox}`}>
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--color-surface)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
            style={{ filter: isRunning ? `drop-shadow(0 0 8px ${color}40)` : 'none' }}
          />
        </svg>

        {/* Center content */}
        <div className="flex flex-col items-center gap-1">
          {/* Phase label */}
          <span
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color }}
          >
            {PHASE_LABELS[currentPhase]}
          </span>

          {/* Time */}
          <div className="text-5xl font-mono font-bold tabular-nums tracking-tight leading-none">
            {formatTime(timeRemaining)}
          </div>

          {/* Pomodoro cycle dots */}
          <div className="flex items-center gap-1.5 mt-3">
            {Array.from({ length: interval }).map((_, i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: i < completedInCycle ? PHASE_COLORS.work : 'var(--color-surface-hover)',
                  transform: i < completedInCycle ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: i < completedInCycle ? `0 0 6px ${PHASE_COLORS.work}60` : 'none',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Session count */}
      <div className="mt-2 text-sm text-[var(--color-text-muted)]">
        {pomodoroCount > 0 ? `${pomodoroCount} session${pomodoroCount > 1 ? 's' : ''} completed` : 'Ready to focus'}
      </div>
    </div>
  );
}
