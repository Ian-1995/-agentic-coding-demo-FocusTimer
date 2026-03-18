import { create } from 'zustand';
import { type TimerPhase } from '../utils/constants';
import { minutesToSeconds } from '../utils/time';
import { useSettingsStore } from './settingsStore';
import { addSession } from '../services/localStorage';

interface TimerState {
  timeRemaining: number;
  currentPhase: TimerPhase;
  pomodoroCount: number;
  isRunning: boolean;
  intervalId: number | null;

  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
}

function getPhaseDuration(phase: TimerPhase): number {
  const settings = useSettingsStore.getState();
  switch (phase) {
    case 'work':
      return minutesToSeconds(settings.work_duration);
    case 'shortBreak':
      return minutesToSeconds(settings.short_break_duration);
    case 'longBreak':
      return minutesToSeconds(settings.long_break_duration);
    default:
      return minutesToSeconds(settings.work_duration);
  }
}

function getNextPhase(currentPhase: TimerPhase, pomodoroCount: number): TimerPhase {
  const settings = useSettingsStore.getState();
  if (currentPhase === 'work') {
    const newCount = pomodoroCount + 1;
    if (newCount % settings.long_break_interval === 0) {
      return 'longBreak';
    }
    return 'shortBreak';
  }
  return 'work';
}

export const useTimerStore = create<TimerState>()((set, get) => ({
  timeRemaining: minutesToSeconds(useSettingsStore.getState().work_duration),
  currentPhase: 'idle' as TimerPhase,
  pomodoroCount: 0,
  isRunning: false,
  intervalId: null,

  start: () => {
    const state = get();
    if (state.isRunning) return;

    let phase = state.currentPhase;
    let time = state.timeRemaining;

    if (phase === 'idle') {
      phase = 'work';
      time = getPhaseDuration('work');
    }

    const id = window.setInterval(() => {
      get().tick();
    }, 1000);

    set({
      isRunning: true,
      currentPhase: phase,
      timeRemaining: time,
      intervalId: id,
    });
  },

  pause: () => {
    const { intervalId } = get();
    if (intervalId !== null) {
      clearInterval(intervalId);
    }
    set({ isRunning: false, intervalId: null });
  },

  reset: () => {
    const { intervalId } = get();
    if (intervalId !== null) {
      clearInterval(intervalId);
    }
    set({
      timeRemaining: minutesToSeconds(useSettingsStore.getState().work_duration),
      currentPhase: 'idle',
      pomodoroCount: 0,
      isRunning: false,
      intervalId: null,
    });
  },

  tick: () => {
    const state = get();
    const newTime = state.timeRemaining - 1;

    if (newTime > 0) {
      set({ timeRemaining: newTime });
      return;
    }

    // Phase completed — show 0:00 first
    set({ timeRemaining: 0 });

    const { intervalId } = state;
    if (intervalId !== null) {
      clearInterval(intervalId);
    }

    let newPomodoroCount = state.pomodoroCount;

    if (state.currentPhase === 'work') {
      newPomodoroCount += 1;
      try {
        const settings = useSettingsStore.getState();
        addSession(settings.work_duration);
      } catch {
        // Don't let session saving break the timer
      }
    }

    const nextPhase = getNextPhase(state.currentPhase, newPomodoroCount);
    const nextDuration = getPhaseDuration(nextPhase);

    // Dispatch custom event for notification
    window.dispatchEvent(
      new CustomEvent('timer-phase-complete', {
        detail: {
          completedPhase: state.currentPhase,
          nextPhase,
          pomodoroCount: newPomodoroCount,
        },
      })
    );

    // Auto-start next phase after a short delay so user sees 0:00
    setTimeout(() => {
      const id = window.setInterval(() => {
        get().tick();
      }, 1000);

      set({
        timeRemaining: nextDuration,
        currentPhase: nextPhase,
        pomodoroCount: newPomodoroCount,
        isRunning: true,
        intervalId: id,
      });
    }, 1500);
  },
}));
