import { useEffect } from 'react';
import { useTimerStore } from '../stores/timerStore';
import { formatTime } from '../utils/time';
import { PHASE_LABELS, type TimerPhase } from '../utils/constants';

const PHASE_ICONS: Record<TimerPhase, string> = {
  idle: '🍅',
  work: '🧑‍💻',
  shortBreak: '🐨',
  longBreak: '🦦',
};

/**
 * Updates the browser tab title with the current timer state.
 * Shows "🧑‍💻 25:00 Focus ▶ FocusTimer" when running, "FocusTimer" when idle.
 */
export function useDocumentTitle() {
  const timeRemaining = useTimerStore((s) => s.timeRemaining);
  const currentPhase = useTimerStore((s) => s.currentPhase);
  const isRunning = useTimerStore((s) => s.isRunning);

  useEffect(() => {
    if (currentPhase === 'idle') {
      document.title = 'FocusTimer';
    } else {
      const time = formatTime(timeRemaining);
      const phase = PHASE_LABELS[currentPhase];
      const icon = PHASE_ICONS[currentPhase];
      document.title = `${icon} ${time} ${phase} ${isRunning ? '▶' : '⏸'} FocusTimer`;
    }

    return () => {
      document.title = 'FocusTimer';
    };
  }, [timeRemaining, currentPhase, isRunning]);
}
