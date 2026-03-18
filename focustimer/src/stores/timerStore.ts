import { create } from 'zustand';
import { type TimerPhase } from '../utils/constants';
import { minutesToSeconds } from '../utils/time';
import { useSettingsStore } from './settingsStore';
import { addSession } from '../services/localStorage';
import api from '../services/api';

interface TimerState {
  timeRemaining: number;
  currentPhase: TimerPhase;
  pomodoroCount: number;
  isRunning: boolean;
  selectedTaskId: string | null;
  intervalId: number | null;

  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  setSelectedTaskId: (id: string | null) => void;
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
  selectedTaskId: null,
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

    if (newTime <= 0) {
      // Phase completed
      const { intervalId } = state;
      if (intervalId !== null) {
        clearInterval(intervalId);
      }

      let newPomodoroCount = state.pomodoroCount;

      if (state.currentPhase === 'work') {
        newPomodoroCount += 1;
        const settings = useSettingsStore.getState();
        const completedAt = new Date().toISOString();
        addSession(settings.work_duration, state.selectedTaskId);

        // Also save to server if user has an access token
        if (localStorage.getItem('access_token')) {
          api.post('/sessions', {
            task_id: state.selectedTaskId,
            duration_minutes: settings.work_duration,
            completed_at: completedAt,
          }).catch(() => { /* will sync later */ });
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

      // Auto-start next phase
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
    } else {
      set({ timeRemaining: newTime });
    }
  },

  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
}));
