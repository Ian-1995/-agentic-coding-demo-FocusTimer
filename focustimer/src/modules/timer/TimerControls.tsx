import { useTimerStore } from '../../stores/timerStore';
import { unlockAudio } from './NotificationManager';

export default function TimerControls() {
  const { isRunning, currentPhase, start, pause, reset } = useTimerStore();

  const handleStart = () => {
    unlockAudio();
    start();
  };

  return (
    <div className="flex items-center gap-4">
      {!isRunning ? (
        <button
          onClick={handleStart}
          className="px-8 py-3 rounded-full text-lg font-semibold bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white transition-colors cursor-pointer"
        >
          {currentPhase === 'idle' ? 'Start' : 'Resume'}
        </button>
      ) : (
        <button
          onClick={pause}
          className="px-8 py-3 rounded-full text-lg font-semibold bg-[var(--color-warning)] hover:opacity-90 text-white transition-colors cursor-pointer"
        >
          Pause
        </button>
      )}

      <button
        onClick={reset}
        className="px-6 py-3 rounded-full text-lg font-semibold bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] transition-colors cursor-pointer"
      >
        Reset
      </button>
    </div>
  );
}
