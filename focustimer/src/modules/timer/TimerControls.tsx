import { useTimerStore } from '../../stores/timerStore';
import { unlockAudio } from './NotificationManager';

export default function TimerControls() {
  const { isRunning, currentPhase, start, pause, reset } = useTimerStore();

  const handleStart = () => {
    unlockAudio();
    start();
  };

  return (
    <div className="flex items-center gap-3">
      {/* Main action button */}
      {!isRunning ? (
        <button
          onClick={handleStart}
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-semibold bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-lg hover:shadow-xl transition-all active:scale-95 cursor-pointer"
          style={{ boxShadow: `0 4px 20px var(--color-primary)40` }}
        >
          ▶
        </button>
      ) : (
        <button
          onClick={pause}
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold bg-[var(--color-warning)] shadow-lg hover:shadow-xl transition-all active:scale-95 cursor-pointer"
        >
          ❚❚
        </button>
      )}

      {/* Reset - only show when not idle */}
      {currentPhase !== 'idle' && (
        <button
          onClick={reset}
          className="w-11 h-11 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] transition-all active:scale-95 cursor-pointer text-sm"
        >
          ↺
        </button>
      )}
    </div>
  );
}
